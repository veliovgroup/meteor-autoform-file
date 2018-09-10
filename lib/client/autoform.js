import { AutoForm } from 'meteor/aldeed:autoform';

if (!global.Buffer) {
  global.Buffer = function () {};
  global.Buffer.isBuffer = () => false;
}

AutoForm.addInputType('fileUpload', {
  template: 'afFileUpload',
  valueOut() {
    return this.val();
  }
});

// single file

AutoForm._globalHooks.onSuccess.push(function (type) {
  if (type === 'insert') {
    try {
      if (this.template) {
        this.template.$('[data-reset-file]').click();
      }
    } catch (e) {
      // we're good here
    }
  }
});

// multiple files

AutoForm.addInputType('fileUploads', {
  template: 'afFileUploads',
  valueOut() {
    return this.val();
  }
});
