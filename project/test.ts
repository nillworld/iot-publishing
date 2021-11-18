import { exec } from 'child_process';

const test = () => {
  console.log('yeah ');
  exec('where npm', (err, out, stderr) => {
    console.log(out);
  });
};

test();
