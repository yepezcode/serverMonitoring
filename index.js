const express = require("express");
const app = express();
const axios = require("axios");
const mqtt = require("mqtt");
// host
const client = mqtt.connect("mqtt://localhost");

//variables
let expoTokenNotifiactions = [];

//subscription
client.on("connect", () => {
  console.log("connected");
  client.subscribe("/test/ssn");
});

//settings
app.set("port", process.env.PORT || 3000);
app.use(express.json());

//start server
app.listen(app.get("port"), () => {
  console.log("server listen on port", app.get("port"));
});
// mqtt listen
client.on("message", (topic, message) => {
  // mosquitto_pub -h localhost -t "/test/ssn" -m '{ "sismo": true }'
  console.log("request.topic", topic);
  console.log("request.body", message.toString());
  let data = JSON.parse(message.toString());
  if (data.sismo) {
    console.log("send alert");
    for (let index = 0; index < expoTokenNotifiactions.length; index++) {
      const element = expoTokenNotifiactions[index];
      axios
        .post(
          "https://exp.host/--/api/v2/push/send",
          {
            to: element,
            title: "sismo",
            body: "Alerta esta ocurriendo un sismo",
            data: { sismo: "hola world" },
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        )
        .then((res) => console.log(res.data))
        .catch();
    }
  }
  /**
   * curl -H "Content-Type: applicatiT "https://exp.host/--/api/v2/push/send" -d '{
  "to": "ExponentPushToken[hyqF1yGJ418IcqOxGrqVQp]",
  "title":"hello",
  "body": "world"
}'

   */
});

// insert data to variables
app.post("/register", function (req, res) {
  let token = req.body.token;
  let exist = expoTokenNotifiactions.find((tokens) => tokens === token);
  if (exist) {
    res.send("usuario ya existe");
  } else {
    expoTokenNotifiactions.push(token);
    console.log(expoTokenNotifiactions);
    res.send("usuario registrado");
  }
});

// signout - delete token when user not logged
app.post("/signout", function (req, res) {
  let token = req.body.token;
  let index = expoTokenNotifiactions.indexOf(token);
  if (index > -1) {
    expoTokenNotifiactions.splice(index, 1);
    console.log(expoTokenNotifiactions);
    res.send("usuario eliminado");
  }
});
