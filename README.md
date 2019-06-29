# Autoform File

<a href="https://www.patreon.com/bePatron?u=20396046">
  <img src="https://c5.patreon.com/external/logo/become_a_patron_button@2x.png" width="160">
</a>

```shell
meteor add ostrio:autoform-files
```

## Description

Upload and manage files with autoForm via [`ostrio:files`](https://github.com/VeliovGroup/Meteor-Files). This package was ported from `yogiben:autoform-file` to use with [`ostrio:files`](https://github.com/VeliovGroup/Meteor-Files) instead of the already deprecated CollectionFS.

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

4. Create your Files Collection (See [`ostrio:files`](https://github.com/VeliovGroup/Meteor-Files))

```js
import { Meteor } from 'meteor/meteor';
import { FilesCollection } from 'meteor/ostrio:files';

const Images = new FilesCollection({
  collectionName: 'Images',
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
    return Images.collection.find({});
  });
}
```

__Note:__ If you don't use Mongo Collection instances (`dburles:mongo-collection-instances`), then the `Images` variable must be attached to *Global* scope. And has same name (*case-sensitive*) as `collectionName` option passed into `FilesCollection#insert({collectionName: 'Images'})` method, `Images` in our case.

To start using `dburles:mongo-collection-instances` simply install it:

```shell
meteor add dburles:mongo-collection-instances
```

5. Define your schema and set the `autoform` property like in the example below

```js
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
<!-- See: https://github.com/VeliovGroup/Meteor-Files/wiki/Insert-(Upload) -->
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

Autoform should be wrapped in `{{#if Template.subscriptionsReady }}` which makes sure that template level subscription is ready. Without it the picture preview won't be shown. You can see update mode example [here](https://github.com/VeliovGroup/meteor-autoform-file/issues/9).

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
        collection: 'Images'
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
        collection: 'Images',
        previewTemplate: 'myFilePreview'
      }
    }
  }
});
```

## Custom upload template

Your custom file upload template data context will be:

- *file* - FS.File instance
- *progress*
- *status*
- Other fields from [`FileUpload` instance](https://github.com/VeliovGroup/Meteor-Files/wiki/Insert-(Upload)#fileupload-methods-and-properties)

```js
({
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
});
```

```handlebars
<template name="myFilePreview">
  <a href="{{file.link}}">{{file.original.name}}</a>
</template>
```

## Support this project:

- [Become a patron](https://www.patreon.com/bePatron?u=20396046) — support my open source contributions with monthly donation
- Use [ostr.io](https://ostr.io) — [Monitoring](https://snmp-monitoring.com), [Analytics](https://ostr.io/info/web-analytics), [WebSec](https://domain-protection.info), [Web-CRON](https://web-cron.info) and [Pre-rendering](https://prerendering.com) for a website
