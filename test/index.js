var script = document.createElement('script');
script.type = 'module';

script.src = '/testOutput/testEntry.js';
document.body.appendChild(script);

var script = document.createElement('script');
script.type = 'text/javascript';

script.src = '/test/tests.js';
document.body.appendChild(script);
