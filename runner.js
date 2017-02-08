let childProcess = require('child_process');

let run = (file, callback) => {
    let running = false;
    let process = childProcess.fork(file);

    //listening for errors as they may prevent exit
    process.on('error', function (err) {
        if (running) return;
        running = true;
        callback(err);
    });

    //call the callback on exit
    process.on('exit', function (exitCode) {
        if (running) return;
        running = true;
        let err = exitCode === 0 ? null : new Error('exit code ' + exitCode);
        callback(err);
    });

};

// Now we can run a script and invoke a callback when complete, e.g.
run('./testChecker.js', function (err) {
    if (err) throw err;
    console.log('::: Finished running the test Checker');
});

setInterval(run, 15000, './testChecker.js', (err) => {
    if (err) throw err;
    console.log('::: Finished running the test checker');
});
