# Google Apps Script Using Clasp

**Create the [Google Apps Script] project** (you only need to do this once)

```
clasp create --type standalone
```

**Set file push order**

```sh
echo "$(jq ".filePushOrder = [
  $(
      while IFS= read -r script; do
          echo "\"${PWD}/${script}\""
      done < .order-of-execution | paste -sd ',' -
  )
]" '.clasp.json')" > '.clasp.json'
```

**Push Google Apps Script project**

```
clasp push
```

**Run this years Secret Santa 🎄**

> [!WARNING]
> This will **send emails** and **update state** in Google Drive.

```
clasp open
```

Then run `year` from the GUI.

# Test Locally Using Custom GAS Interpreter

Custom GAS Interpreter uses [Node.js] to execute each line of JS, from each
file, according to `.order-of-execution`.

```
./local-test
```

> Average number of repeated recipients per year: 0.94

[SecretSantaJS]: https://github.com/skeletony007/SecretSantaJS
[Google Apps Script]: https://developers.google.com/apps-script/
[clasp]: https://github.com/google/clasp
[Node.js]: https://github.com/nodejs/node
