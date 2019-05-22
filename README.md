Autoform File
=============

### Description
Upload and manage files with autoForm via [`ostrio:files`](https://github.com/VeliovGroup/Meteor-Files). This package was ported from `yogiben:autoform-file` to use with [`ostrio:files`](https://github.com/VeliovGroup/Meteor-Files) instead of the already deprecated CollectionFS.

### Quick Start:

 - Install `meteor add ostrio:autoform-files`
 - Install `meteor add ostrio:files`, *if not yet installed*
 - Add this config to `simpl-schema` NPM package (depending of the language that you are using):
```javascript
SimpleSchema.setDefaultMessages({
  initialLanguage: 'en',
  messages: {
    en: {
      uploadError: '{{value}}', //File-upload
    },
  }
});
```
 - Create your Files Collection (See [`ostrio:files`](https://github.com/VeliovGroup/Meteor-Files))
```javascript
const Images = new FilesCollection({
  collectionName: 'Images',
  allowClientCode: true, // Required to let you remove uploaded file
  onBeforeUpload(file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 10485760 && /png|jpg|jpeg/i.test(file.ext)) {
      return true;
    } else {
      return 'Please upload image, with size equal or less than 10MB';
    }
  }
});

if (Meteor.isClient) {
  Meteor.subscribe('files.images.all');
}

if (Meteor.isServer) {
  Meteor.publish('files.images.all', () => {
    return Images.collection.find({});
  });
}
```
__Note:__ If you don't use Mongo Collection instances (`dburles:mongo-collection-instances`), then the `Images` variable must be attached to *Global* scope. And has same name (*case-sensitive*) as `collectionName` option passed into `FilesCollection#insert({collectionName: 'Images'})` method, `Images` in our case.

To start using `dburles:mongo-collection-instances` simply install it:
```shell
meteor add dburles:mongo-collection-instances
```


 - Define your schema and set the `autoform` property like in the example below
```javascript
Schemas = {};
Posts   = new Meteor.Collection('posts');
Schemas.Posts = new SimpleSchema({
  title: {
    type: String,
    max: 60
  },
  picture: {
    type: String,
    autoform: {
      afFieldInput: {
        type: 'fileUpload',
        collection: 'Images',
        uploadTemplate: 'uploadField', // <- Optional
        previewTemplate: 'uploadPreview', // <- Optional
        insertConfig: { // <- Optional, .insert() method options, see: https://github.com/VeliovGroup/Meteor-Files/wiki/Insert-(Upload)
          meta: {},
          isBase64: false,
          transport: 'ddp',
          streams: 'dynamic',
          chunkSize: 'dynamic',
          allowWebWorkers: true
        }
      }
    }
  }
});

Posts.attachSchema(Schemas.Posts);
```

The `collection` property must be the same as name of your *FilesCollection* (*case-sensitive*), `Images` in our case.

Generate the form with `{{> quickform}}` or `{{#autoform}}` e.g.:

##### Insert mode:

```html
{{> quickForm id="postsInsertForm" collection="Posts" type="insert"}}
<!-- OR -->
{{#autoForm id="postsInsertForm" collection="Posts" type="insert"}}
  {{> afQuickField name="title"}}
  {{> afQuickField name="picture"}}
  <button type="submit" class="btn btn-primary">Insert</button>
{{/autoForm}}

<!-- OR with .insert() method options -->
<!-- See: https://github.com/VeliovGroup/Meteor-Files/wiki/Insert-(Upload) -->
{{#autoForm id="postsInsertForm" collection="Posts" type="insert"}}
  {{> afQuickField name="title"}}
  {{> afQuickField name="picture" transport="http" allowWebWorkers="false"}}
  <button type="submit" class="btn btn-primary">Insert</button>
{{/autoForm}}
```

##### Update mode:

```html
{{#if Template.subscriptionsReady }}
  {{> quickForm id="postsUpdateForm" collection="Posts" type="update" doc=getPost}}
{{/if}}
<!-- OR -->
{{#if Template.subscriptionsReady }}
  {{#autoForm id="postsUpdateForm" collection="Posts" type="update" doc=getPost}}
    {{> afQuickField name="title"}}
    {{> afQuickField name="picture"}}
    <button type="submit" class="btn btn-primary">Update</button>
  {{/autoForm}}
{{/if}}
```

Autoform should be wrapped in `{{#if Template.subscriptionsReady }}` which makes sure that template level subscription is ready. Without it the picture preview won't be shown. You can see update mode example [here](https://github.com/VeliovGroup/meteor-autoform-file/issues/9).

### Accept configuration

##### Usage

You can configure the file selector, to only allow certain types of files using the `accept` property:

```javascript
Schemas.Posts = new SimpleSchema({
  title: {
    type: String,
    max: 60
  },
  picture: {
    type: String,
    autoform: {
      afFieldInput: {
        type: 'fileUpload',
        collection: 'Images',
        accept: 'image/*' // or use explicit ext names like .png,.jpg
      }
    }
  }
});
```

The accept values works makes use of the native HTML `accept` attribute. Read more at the [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#Unique_file_type_specifiers).

Please read the section on **custom upload templates** and how to integrate configs like *accept* to your custom template.

### Multiple images // not fully supported yet
If you want to use an array of images inside you have to define the autoform on on the [schema key](https://github.com/aldeed/meteor-simple-schema#schema-keys)

```javascript
Schemas.Posts = new SimpleSchema({
  title: {
    type: String,
    max: 60
  },
  pictures: {
    type: Array,
    label: 'Choose file' // <- Optional
  },
  "pictures.$": {
    type: String,
    autoform: {
      afFieldInput: {
        type: 'fileUpload',
        collection: 'Images'
      }
    }
  }
})
```

### Custom file preview

Your custom file preview template data context will be:

- *file* - fileObj instance

```javascript
picture: {
  type: String,
  autoform: {
    afFieldInput: {
      type: 'fileUpload',
      collection: 'Images',
      previewTemplate: 'myFilePreview'
    }
  }
}
```

```html
<template name="myFileUpload">
  <a href="{{file.link}}">{{file.original.name}}</a>
</template>
```


### Custom upload template

Your custom file upload template data context will be:

- *file* - FS.File instance
- *progress*
- *status*
- *config* an object containing several configs to upload behavior, such as `accept`
- Other fields from [`FileUpload` instance](https://github.com/VeliovGroup/Meteor-Files/wiki/Insert-(Upload)#fileupload-methods-and-properties)

```javascript
picture: {
  type: String,
  autoform: {
    afFieldInput: {
      type: 'fileUpload',
      collection: 'Images',
      uploadTemplate: 'myFileUpload'
    }
  }
}
```

```html
<template name="myFileUpload">
  {{#with progress}}
    <!-- if there is a progress present, we can use it to determine the upload progress -->
    <progress value="{{this.get}}" max="100"></progress>
  {{/with}}
  {{#with file}}
    <!-- if there is a file present, we have a file selected for upload -->
    <span>Uploading {{this.name}}</span>
  {{else}}
     <!-- otherwise we provide the upload -->
     <input data-files-collection-upload class="form-control af-file-upload-capture" type="file" accept="{{config.accept}}" />
  {{/if}}
</template>
```

##### Note on upload configs: 

If you pass any config, like `accept` your upload data won't be falsey anymore,
so you should update your template to the example above and check for each of the given properties.
This is however backwards-compatible and will not break your older templates if you don't need any of the upload config
introduced in > 2.1.4 releases.

Support this project:
======
This project wouldn't be possible without [ostr.io](https://ostr.io).

Using [ostr.io](https://ostr.io) you are not only [protecting domain names](https://ostr.io/info/domain-names-protection), [monitoring websites and servers](https://ostr.io/info/monitoring), using [Prerendering for better SEO](https://ostr.io/info/prerendering) of your JavaScript website, but support our Open Source activity, and great packages like this one could be available for free.
