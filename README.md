[![support](https://img.shields.io/badge/support-GitHub-white)](https://github.com/sponsors/dr-dimitru)
[![support](https://img.shields.io/badge/support-PayPal-white)](https://paypal.me/veliovgroup)
[![Mentioned in Awesome ostrio:files](https://awesome.re/mentioned-badge.svg)](https://project-awesome.org/Urigo/awesome-meteor#files)
[![GitHub stars](https://img.shields.io/github/stars/veliovgroup/Meteor-Files.svg)](https://github.com/veliovgroup/Meteor-Files/stargazers)
<a href="https://ostr.io/info/built-by-developers-for-developers?ref=github-mail-time-repo-top"><img src="https://ostr.io/apple-touch-icon-60x60.png" height="20"></a>
<a href="https://meteor-files.com/?ref=github-mail-time-repo-top"><img src="https://meteor-files.com/apple-touch-icon-60x60.png" height="20"></a>

# Autoform File

```shell
# meteor@>=1.9
meteor add ostrio:autoform-files

# meteor@<1.9
meteor add ostrio:autoform-files@2.2.1
```

## Description

Upload and manage files with autoForm via [`ostrio:files`](https://github.com/veliovgroup/Meteor-Files). This package was ported from `yogiben:autoform-file` to use with [`ostrio:files`](https://github.com/veliovgroup/Meteor-Files) instead of the already deprecated CollectionFS.

## Quick Start:

1. Install `meteor add ostrio:autoform-files`
2. Install `meteor add ostrio:files`, *if not yet installed*
3. Add this config to `simpl-schema` NPM package (depending of the language that you are using):

```js
SimpleSchema.setDefaultMessages({
  initialLanguage: 'en',
  messages: {
    en: {
      uploadError: '{{value}}', //File-upload
    },
  }
});
```

4. Create your Files Collection (See [`ostrio:files`](https://github.com/veliovgroup/Meteor-Files))

```js
import { Meteor } from 'meteor/meteor';
import { FilesCollection } from 'meteor/ostrio:files';

const imagesCollection = new FilesCollection({
  collectionName: 'images',
  allowClientCode: true, // Required to let you remove uploaded file
  onBeforeUpload(file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 10485760 && /png|jpg|jpeg/i.test(file.ext)) {
      return true;
    }
    return 'Please upload image, with size equal or less than 10MB';
  }
});

if (Meteor.isClient) {
  Meteor.subscribe('files.images.all');
}

if (Meteor.isServer) {
  Meteor.publish('files.images.all', () => {
    return imagesCollection.collection.find({});
  });
}
```

__Note:__ If you don't use Mongo Collection instances (`dburles:mongo-collection-instances`), then the `imagesCollection` variable must be attached to *Global* scope. And has same name (*case-sensitive*) as `collectionName` option passed into `FilesCollection#insert({collectionName: 'images'})` method, `images` in our case.

To start using `dburles:mongo-collection-instances` simply install it:

```shell
meteor add dburles:mongo-collection-instances
```

5. Define your schema and set the `autoform` property like in the example below

```js
Schemas = {};
Posts = new Meteor.Collection('posts');
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
        collection: 'images',
        uploadTemplate: 'uploadField', // <- Optional
        previewTemplate: 'uploadPreview', // <- Optional
        insertConfig: { // <- Optional, .insert() method options, see: https://github.com/veliovgroup/Meteor-Files/blob/master/docs/insert.md
          meta: {},
          isBase64: false,
          transport: 'ddp',
          chunkSize: 'dynamic',
          allowWebWorkers: true
        }
      }
    }
  }
});

Posts.attachSchema(Schemas.Posts);
```

The `collection` property must be the same as name of your *FilesCollection* (*case-sensitive*), `images` in our case.

Generate the form with `{{> quickform}}` or `{{#autoform}}` e.g.:

## Insert mode:

```handlebars
{{> quickForm id="postsInsertForm" collection="Posts" type="insert"}}
<!-- OR -->
{{#autoForm id="postsInsertForm" collection="Posts" type="insert"}}
  {{> afQuickField name="title"}}
  {{> afQuickField name="picture"}}
  <button type="submit" class="btn btn-primary">Insert</button>
{{/autoForm}}

<!-- OR with .insert() method options -->
<!-- See: https://github.com/veliovgroup/Meteor-Files/wiki/Insert-(Upload) -->
{{#autoForm id="postsInsertForm" collection="Posts" type="insert"}}
  {{> afQuickField name="title"}}
  {{> afQuickField name="picture" transport="http" allowWebWorkers="false"}}
  <button type="submit" class="btn btn-primary">Insert</button>
{{/autoForm}}
```

## Update mode:

```handlebars
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

Autoform should be wrapped in `{{#if Template.subscriptionsReady }}` which makes sure that template level subscription is ready. Without it the picture preview won't be shown. You can see update mode example [here](https://github.com/veliovgroup/meteor-autoform-file/issues/9).

## Accept configuration

### Usage

You can configure the file selector, to only allow certain types of files using the `accept` property:

```js
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
        collection: 'images',
        accept: 'image/*' // or use explicit ext names like .png,.jpg
      }
    }
  }
});
```

The accept values works makes use of the native HTML `accept` attribute. Read more at the [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#Unique_file_type_specifiers).

Please read the section on __custom upload templates__ and how to integrate configs like *accept* to your custom template.

## Multiple images

Multiple images — __not fully supported yet__

If you want to use an array of images inside you have to define the autoform on on the [schema key](https://github.com/aldeed/meteor-simple-schema#schema-keys)

```js
Schemas.Posts = new SimpleSchema({
  title: {
    type: String,
    max: 60
  },
  pictures: {
    type: Array,
    label: 'Choose file' // <- Optional
  },
  'pictures.$': {
    type: String,
    autoform: {
      afFieldInput: {
        type: 'fileUpload',
        collection: 'images'
      }
    }
  }
});
```

## Custom file preview

Your custom file preview template data context will be:

- *file* - fileObj instance

```js
({
  picture: {
    type: String,
    autoform: {
      afFieldInput: {
        type: 'fileUpload',
        collection: 'images',
        previewTemplate: 'myFilePreview'
      }
    }
  }
});
```

```handlebars
<template name="myFileUpload">
  <a href="{{file.link}}">{{file.original.name}}</a>
</template>
```

## Custom upload template

Your custom file upload template data context will be:

- *file* - FS.File instance
- *progress*
- *status*
- *config* an object containing several configs to upload behavior, such as `accept`
- Other fields from [`FileUpload` instance](https://github.com/veliovgroup/Meteor-Files/wiki/Insert-(Upload)#fileupload-methods-and-properties)

```js
({
  picture: {
    type: String,
    autoform: {
      afFieldInput: {
        type: 'fileUpload',
        collection: 'images',
        uploadTemplate: 'myFileUpload'
      }
    }
  }
});
```

```handlebars
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

### Note on upload configs:

If you pass any config, like `accept` your upload data won't be falsy anymore,
so you should update your template to the example above and check for each of the given properties.
This is however backwards-compatible and will not break your older templates if you don't need any of the upload config
introduced in > 2.1.4 releases.

## Support this project:

- Upload and share files using [☄️ meteor-files.com](https://meteor-files.com/?ref=github-mail-time-repo-footer) — Continue interrupted file uploads without losing any progress. There is nothing that will stop Meteor from delivering your file to the desired destination
- Use [▲ ostr.io](https://ostr.io?ref=github-mail-time-repo-footer) for [Server Monitoring](https://snmp-monitoring.com), [Web Analytics](https://ostr.io/info/web-analytics?ref=github-mail-time-repo-footer), [WebSec](https://domain-protection.info), [Web-CRON](https://web-cron.info) and [SEO Pre-rendering](https://prerendering.com) of a website
- Star on [GitHub](https://github.com/veliovgroup/meteor-autoform-file)
- Star on [Atmosphere](https://atmospherejs.com/ostrio/autoform-files)
- [Sponsor via GitHub](https://github.com/sponsors/dr-dimitru) — support open source contributions on a regular basis
- [Support via PayPal](https://paypal.me/veliovgroup) — support our open source contributions
