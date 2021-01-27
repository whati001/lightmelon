
# Lightmelon

Simple task runner to validate webpage performance continuesly with [Google Chrome Lighthouse](https://developers.google.com/web/tools/lighthouse/).

Please consider that this project is still in beta. Hence, it may break by running it as a long time job.

To support authentication against pages, we launch and support browser driving via [puppeteer-core](https://www.npmjs.com/package/puppeteer-core)

## Getting Started
To get a local copy up and running follow these simple steps.

### Prerequisites
This is an example of how to list things you need to use the software and how to install them.
* yarn
```sh
npm install npm@latest -g
npm install yarn
```
* nodejs
Please download either the executable directly from the [webpage](https://nodejs.org/en/download/), or use your favourite package manager.
```sh
# Ubuntu/Debian
apt install nodejs npm
# RHEL
yum install rh-nodejs
```

### Configuration
The app uses two different configuration files. `app.json` includes everything related to the app itself. Like how to output the reports, worker sleep interval, browser configuration and so forth. Normally there is no need to change much in this file.
`pages.json` includes an array of pages to test. This file is more of interrest for the user and should be adopted as needed.

#### app.json
!!! in beta, only file output is supported and without headless. 
In addition, need to move out the `auth` property from app.json. 
Please just update the profilePath and userProfile.
```json
{
  "output": [
    {
      "type": "file",
      "folder": "./result/"
    }
  ],
  "browser": {
    "type": "chromium",
    "executable": "/usr/bin/chromium",
    "headless": false,
    "auth": {
      "email": "andreas.karner[at]student.tugraz.at",
      "pwd": "pwdHere"
    }
  },
  "workerInterval": 1000
}
```

#### pages.json
Please define some pages to validate. Please consider that if you need authentication, that you logged in first.
Login logic is set via `auth` property, whose needs to match with one in the `src/auth/index.ts` switch statement.
!!Find better solution than this one.
```json
[
  {
    "name": "google",
    "url": "https://google.com",
    "interval": 2
  },
  {
    "name": "rehkaFish",
    "url": "https://fisch.rehka.dev",
    "interval": 1,
    "auth": "someAuth"
  }
]

```

### Installation

1. Clone the repo
```sh
git clone https://github.com/whati001/lightmelon.git
```
2. Install NPM packages
```sh
yarn install
```

## Usage
After installation, you can either build the project or just a dev server. The dev server comes with auto reload on change functionablity.

### Start program
This will start the program with the help of `ts-node`.
```sh
yarn run start
```

### Build production
Will compile the typescript source into js code and store into `./build/`.
```sh
yarn run clean
yarn run lint
yarn run build
```

### Dev server
Will start `nodemon` and watch for file changes
```sh
yarn run watch
```

### Pkg single executable
Create a single executable for releasing a version.
Please change the release os as needed in `package.json`.
```sh
yarn run pkg
```

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Or just buy me a beer :)
<div>
<a href="https://www.buymeacoffee.com/whati001" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-green.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
</div>


## Security
This project was added to the analyse tool [LGTM](https://lgtm.com/projects/g/whati001/lightmelon/). Please check the result after changing something.

## License
Distributed under the GNU License. See LICENSE for more information.

## Contact
* [whati001](https://github.com/whati001)
