import { Meteor }      from 'meteor/meteor';
import { AutoForm }    from 'meteor/aldeed:autoform';
import { Template }    from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Mongo }       from 'meteor/mongo';
import { Random }      from 'meteor/random';

const defaultInsertOpts = {
  meta: {},
  isBase64: false,
  transport: 'ddp',
  chunkSize: 'dynamic',
  allowWebWorkers: true
};

const multiQueue = new ReactiveVar([]);

Template.afFileUpload.onCreated(function () {
  const self = this;
  if (!this.data) {
    this.data = {
      atts: {}
    };
  }

  // primary method: use dburles:mongo-collection-instances
  if (Mongo.Collection.get) {
    const mongoCollection = Mongo.Collection.get(this.data.atts.collection);
    this.collection = mongoCollection && mongoCollection.filesCollection;
  }

  // 1. fallback using global scope
  if (!this.collection) {
    this.collection = global[this.data.atts.collection];
  }

  // 2. fallback using Meteor.connection / local collections
  // if the Meteor release is newer than 2016 -> use _stores
  // else use older _mongo_livedata_collections
  // see https://github.com/meteor/meteor/pull/5845
  if (!this.collection) {
    const storedCollection =  Meteor.connection._stores[this.data.atts.collection];
    this.collection = (storedCollection && storedCollection._getCollection)
      ? storedCollection._getCollection().filesCollection
      : Meteor.connection._mongo_livedata_collections[this.data.atts.collection];
  }

  if (!this.collection) {
    throw new Meteor.Error(404, `[meteor-autoform-files] No collection found by name "${this.data.atts.collection}"`,
      'Collection\'s name is case-sensetive. Please, make sure you\'re using right collection name.');
  }

  this.uploadTemplate  = this.data.atts.uploadTemplate || null;
  this.previewTemplate = this.data.atts.previewTemplate || null;
  this.accept          = this.data.atts.accept || null;
  this.insertConfig    = Object.assign({}, defaultInsertOpts, this.data.atts.insertConfig || {});
  delete this.data.atts.insertConfig;

  if (!isNaN(this.insertConfig.chunkSize)) {
    this.insertConfig.chunkSize = parseInt(this.insertConfig.chunkSize);
  } else if (this.insertConfig.chunkSize !== 'dynamic') {
    this.insertConfig.chunkSize = 'dynamic';
  }

  this.collectionName = function () {
    return self.data.atts.collection;
  };

  this.currentUpload = new ReactiveVar(false);
  this.inputName     = this.data.name;
  this.fileId        = new ReactiveVar(this.data.value || false);
  this.formId        = AutoForm.getFormId();
  this.multiple      = this.data.atts.multiple;

  if (this.multiple) {
    this.autorun(() => {
      const queued = multiQueue.get();
      if (!this.fileId.get() && !this.currentUpload.get() && queued.length > 0) {
        const file = queued.shift();
        uploadFile(file, self);
      }
    })
  }

  return;
});

Template.afFileUpload.helpers({
  previewTemplate() {
    return Template.instance().previewTemplate;
  },
  uploadTemplate() {
    return Template.instance().uploadTemplate;
  },
  uploadTemplateData() {
    const instance = Template.instance();
    const currentUpload = instance.currentUpload.get();
    const { accept } = instance;

    // here we can check for upload template configs, that have been added after 2.1.4 and return either
    // an object with "config" merged with "currentUpload" to stay backwards compatible as possible
    if (accept) {
      const config = { config: { accept } };
      return Object.assign({}, config, currentUpload);
    }

    return currentUpload;
  },
  currentUpload() {
    return Template.instance().currentUpload.get();
  },
  fileId() {
    return Template.instance().fileId.get() || this.value;
  },
  uploadedFile() {
    const template = Template.instance();
    const _id = template.fileId.get() || this.value;
    if (typeof _id !== 'string' || _id.length === 0) {
      return null;
    }
    return template.collection.findOne({_id});
  },
  accept() {
    return Template.instance().accept;
  },
  multiple() {
    return Template.instance().multiple;
  },
  inputAtts(formContext) {
    const { atts } = formContext;
    if (!atts) return {};
    delete atts.insertConfig;
    return atts;
  }
});

Template.afFileUpload.events({
  'click [data-reset-file]'(e, template) {
    e.preventDefault();
    template.fileId.set(false);
    return false;
  },
  'click [data-remove-file]'(e, template) {
    e.preventDefault();
    template.fileId.set(false);
    if (template.data.value) {
      delete template.data.value;
    }
    try {
      this.remove();
    } catch (error) {
      // we're good here
    }
    return false;
  },
  'change [data-files-collection-upload]'(e, template) {
    if (template.multiple && e.currentTarget.files && e.currentTarget.files.length > 1) {
      const formId = AutoForm.getFormId();
      const {minCount} = template;
      const {maxCount} = template;
      const schema = AutoForm.getFormSchema(formId);
      const inputName = template.inputName && template.inputName.split('.')[0];
      const queued = multiQueue.get();

      for (let i = 0; i< e.currentTarget.files.length; i++) {
        const file = e.currentTarget.files[i];
        queued.push(file);
        AutoForm.arrayTracker.addOneToField(formId, inputName, schema, minCount, maxCount);
      }

      multiQueue.set(queued);
      return;
    }

    if (e.currentTarget.files && e.currentTarget.files[0]) {
      uploadFile(e.currentTarget.files[0], template);
    }
  }
});

function uploadFile (file, template) {
  const opts = Object.assign({}, defaultInsertOpts, template.insertConfig, {file});

  const upload = template.collection.insert(opts, false);
  let ctx;
  try {
    ctx = AutoForm.getValidationContext(template.formId);
  } catch (exception) {
    // Fix: "TypeError: Cannot read property '_resolvedSchema' of undefined"
    ctx = AutoForm.getValidationContext();
  }

  upload.on('start', function () {
    ctx.reset();
    template.currentUpload.set(this);
    return;
  });

  upload.on('error', function (error) {
    ctx.reset();
    ctx.addValidationErrors([{name: template.inputName, type: 'uploadError', value: error.reason}]);
    template.$(e.currentTarget).val('');
    return;
  });

  upload.on('end', function (error, fileObj) {
    if (!error) {
      if (template) {
        template.fileId.set(fileObj._id);
      }
    }
    template.currentUpload.set(false);
    return;
  });

  upload.start();
}