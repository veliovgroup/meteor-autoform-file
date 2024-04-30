Package.describe({
  name: 'ostrio:autoform-files',
  summary: 'File upload for AutoForm using ostrio:files',
  description: 'File upload for AutoForm using ostrio:files',
  version: '2.5.2',
  git: 'https://github.com/veliovgroup/meteor-autoform-file.git'
});

Package.onUse((api) => {
  api.versionsFrom(['2.0', '3.0-rc.0']);

  api.use([
    'check',
    'ecmascript',
    'mongo',
    'reactive-var',
    'templating@1.4.2',
    'aldeed:autoform@7.0.0 || 8.0.0-rc',
    'ostrio:files@2.2.0 || 3.0.0-beta.5'
  ], 'client');

  api.addFiles([
    'lib/client/autoform.js',
    'lib/client/fileUpload.html',
    'lib/client/fileUpload.js',
    'lib/client/uploadImageDemo.html',
    'lib/client/uploadFileDemo.html'
  ], 'client');
});
