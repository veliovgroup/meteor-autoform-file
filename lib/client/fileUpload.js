Template.afFileUpload.onCreated(function () {
  this.collection = Meteor.connection._mongo_livedata_collections[this.data.atts.collection]
  if (!this.collection) {
    throw new Meteor.Error(404, '[meteor-autoform-files] No such collection "' + this.data.atts.collection + '"');
  }
  this.fileId         = new ReactiveVar(this.data.value);
  this.collectionName = () => this.data.atts.collection
  this.currentUpload  = new ReactiveVar(false);
  this.inputName      = this.data.name;
  return;
});

Template.afFileUpload.helpers({
  currentUpload() {
    return Template.instance().currentUpload.get();
  },
  uploadedFile() {
    return global[Template.instance().collectionName()].findOne({
      _id: Template.instance().fileId.get()
    });
  },
  fileId() {
    return Template.instance().fileId.get();
  }
});

Template.afFileUpload.events({
  //remove after update
  'click [data-remove-file]'(e, template) {
    template.fileId.set(false);
    $('[data-files-collection-upload]').val("")
    try {
      this.remove();
    } catch (e) {}
    return;
  },
  'change [data-files-collection-upload]'(e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      const upload = global[template.collectionName()].insert({
        file: e.currentTarget.files[0],
        streams: 'dynamic',
        chunkSize: 'dynamic'
      }, false);

      upload.on('start', function () {
        AutoForm.getValidationContext().resetValidation();
        template.currentUpload.set(this);
        return;
      });

      upload.on('error', function (error) {
        AutoForm.getValidationContext().resetValidation();
        AutoForm.getValidationContext().addInvalidKeys([{name: Template.instance().inputName, type: "uploadError", value: error.reason}]);
        $(e.currentTarget).val('');
        return;
      });

      upload.on('end', (error, fileObj) => {
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
  }
});