# odysseus-admin

Admin UI for GM use for managing *everything* that goes on in the [Odysseus backend](https://github.com/OdysseusLarp/odysseus-backend).

## Some screenshots

![Screenshot 2024-07-12 at 14 00 39](https://github.com/user-attachments/assets/ffa3cc96-3bac-479e-b7d9-9812bdeb50fa)

![Screenshot 2024-07-12 at 14 00 59](https://github.com/user-attachments/assets/c7c6479f-41c8-4ceb-88ea-a13be46b2b9f)

![Screenshot 2024-07-12 at 14 07 40](https://github.com/user-attachments/assets/5e34425c-a438-4aa4-8248-7082b74a076a)

![Screenshot 2024-07-12 at 14 00 23](https://github.com/user-attachments/assets/afd50de7-85d4-48a7-ba0a-fd38c72646c3)

## Tech

- Node v18.14.0
- Vue v2.7.14

## Local setup

* **`NOTE!`** Make sure you are running [Odysseus Backend](https://github.com/OdysseusLarp/odysseus-backend)!
* Run `npm install` to install dependencies
* Run `npm run serve` for compiles and hot-reloads for development

Admin UI should now be available at [http://localhost:8090/](http://localhost:8090/)

## Local setup in VSCode dev container

You can also run the app using [VSCode dev containers](https://code.visualstudio.com/docs/devcontainers/containers). Create/update your .env file like in the local setup instructions.

### Requirements

- [Docker](https://www.docker.com/)
- [VSCode](https://code.visualstudio.com/) with [Dev Containers](https://code.visualstudio.com/docs/devcontainers/tutorial#_install-the-extension) extension
- [Odysseus Backend](https://github.com/OdysseusLarp/odysseus-backend)

### Setup

* **`NOTE!`** Make sure you are running `Odysseus Backend`!
* Open new window in VSCode
* File --> Open Folder... --> `odysseus-admin`
* VSCode will ask do you want to `Reopen in Container` --> Click it
    * If you are too slow --> Click the button in left bottom corner (looks like two L:s or disjointed ><) and choose `Reopen in Container` from the menu.
* VSCode will then build and start up the dev container, installs npm packages and starts the service.

### Problems?

* Try to rebuild the container: Click the button in left bottom corner (looks like two L:s or disjointed >< with the container name) and choose `Rebuild Container` from the menu.
* You might run into [this issue](https://github.com/microsoft/vscode-remote-release/issues/7305) on ARM processors, see the issue for potential workarounds.

## Jumping the Odysseus (from Admin UI)

* Make a jump [Admin UI Jump drive tab tab](http://localhost:8090/#/jump)
    - `Move to calculating` --> OK
    - `Approve jump` --> OK
    - `Mark jump crystal change done` --> OK
    - `Mark jump reactor done` --> OK
    - `Next state (prep complete)` --> OK
    - `Initiate jump` --> OK --> Wait 60 seconds
    - If you want to break the ship click `Change to breaking jump` or `Change to minor breaking jump` --> OK
    - `End jump` --> OK
* To continue jumping 
    - `Bypass engineer fixes` --> OK
    - `Mark cooldown done` --> OK

## Breaking Odysseus Manually (for testing purposes)

* Go to [Admin UI Empty Epsilon tab](http://localhost:8090/#/emptyepsilon)
    - `Disable connection` and `Disable state synchronization` (otherwise it will sync back to full health since Empty Epsilon is not running and it defaults to full health)
    - Break things by `Update values` example
        - Target type: systems
        - Target: impulse
        - Value type: health
        - Value: 0.7
        - `Set value`

## Fixing Odysseus Malfunctions (for testing purposes)

* Either use [HANSCA](https://github.com/OdysseusLarp/odysseus-HANSCA)
* Or from [Admin UI Data stores tab](http://localhost:8090/#/data)
    - Choose `game` or `box` from dropdown
    - Scroll to see which `Status` is `broken`
    - Click the one which is `broken`
    - Change `"status": "broken",` to `"status": "fixed",`
    - OK

## Other Available Scripts

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
