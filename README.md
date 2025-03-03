# course-pwa-the-complete-guide
https://www.udemy.com/course/progressive-web-app-pwa-the-complete-guide/

# About manifest.json

In this project, it lies in the public/src folder, but bear in mind that when publishing the project, the manifest.json's location is supposed to be the root of your web site.

## References

https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest

https://web.dev/articles/add-manifest
https://web.dev/articles/customize-install

## Notes

In the course, he mentions we need to import the manifest in all our html files. (I should double check that).

```html
  <link rel="manifest" href="/manifest.json">
```  

## Relevant properties

name (splash screen), short_name, start_url, scope, display (usually standalone), background_color (splash screen), theme color (top bar), description (bookmarks), lang, orientation, icons (array), related_applications (if you have a native app) 

## Remote Debugging

https://developer.chrome.com/docs/devtools/remote-debugging?hl=en
