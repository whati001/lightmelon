
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
The application uses a single configuration file located in the `config` directory called `lighthouse.yaml`. The path is hardcoded within the app, so you are not able to define it via program arguments. Please feel free to change this via a PR.

The file is separated into three different parts, please see below a detail description for each one:

#### App
The app section includes all everything which is realated to the app itself. Because the app is not shipped with an browser included, please define the browser executable path properly and if you would like to run it headless or headfull. Because we use [puppeteer](https://github.com/puppeteer/puppeteer) under the hood, the app supports the same browers, but we recommend to use either [chrome](https://www.google.com/chrome/) or [chromium](https://www.chromium.org/). 

We are able to define how many workers we want to spawn, with worker we refer to browser doing lighthouse reports simultaneously. With the sleep time, you can controll how long the worker should sleep until he polls the open task queue. (not sure if sleep works well with js, please fix via PR)

Last part of this configuration is to define where to store the results. Currenlty only "file" and "http" is supported. As you can see, the output is defined as an array, hence you can use multiple instances of "file" and "http".

```yaml
app:
  browser:
    executable: "/usr/bin/chromium"
    headless: false
  worker:
    instances: 1
    sleepInterval: 1000
  output:
    - type: "file"
      folder: "./result/"
    - type: "http"
      method: "PUT"
      url: "https://localhost:2711/some/endpoint"
```
#### Auth
The authentication config is still a little bit experimental, but please feel free to extend the functionality via a PR. The application was written to check Microsoft Power BI reports, hence only impl msPowerBi is supported yet.
To define stuff properly, please follow this rules. Property name is used to link pages and authentication together. Please checkout pages section below. Type defines which fields should be set, please checkout `./src/types/config.d.ts` and `./src/utils/ConfigParser.ts` but currenlty only "WinAdAuth" is supported. Impl defines which code should get executed for the login, please checkout `./auth/index.ts` file.
```yaml
auth:
  - name: "WinADPowerBi"
    type: "WinAdAuth"
    impl: "msPowerBi"
    userMail: "andreas.karner@student.tugraz.at"
```

#### Pages
Last but not least, this section defined which pages we would like to test.
Please feel free to add as many pages as you like, please consider that each property is manatory except "auth". If you do not need any authentication, please either remove the prop entirely or set it to "none". If you need one, please set the name from the auth section. Like in the example below, we would liek to use the authentication with the name "WinAdPowerBi" for the page "fischRehka", which tells the application to use the "msPowerBi" code and login as "andreas.karner@student.tugraz.at".
```yaml
pages:
  - name: "google"
    url: "https://google.com"
    interval: 1
    auth: "none"
  - name: "fischRehka"
    url: "https://fisch.rehka.dev"
    interval: 2
    auth: "WinADPowerBi"
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
