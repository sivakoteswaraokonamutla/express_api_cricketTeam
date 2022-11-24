const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbpath = path.join(__dirname, "cricketTeam.db");
let db = null;
const initializedbandserver = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializedbandserver();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

let myarr = [];
app.get("/players/", async (request, response) => {
  const getplayersquery = `
    select * from cricket_team order by player_id;`;
  const playersarray = await db.all(getplayersquery);
  for (let each of playersarray) {
    let res = convertDbObjectToResponseObject(each);
    myarr.push(res);
  }
  console.log(myarr);
  response.send(myarr);
});

app.post("/players/", async (request, response) => {
  const playerdetails = request.body;
  const { playerName, jerseyNumber, role } = playerdetails;
  const addplayerquery = `insert into cricket_team(player_name,jersey_number,role)
    values('${playerName}',${jerseyNumber},'${role}');`;
  const dbresponse = await db.run(addplayerquery);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getplayerquery = `select * from cricket_team
    where player_id=${playerId};`;
  const playerofid = await db.get(getplayerquery);
  console.log(typeof playerofid);
  console.log(playerofid);
  let ot = convertDbObjectToResponseObject(playerofid);

  response.send(ot);
});

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerdetailsofput = request.body;
  const { playerName, jerseyNumber, role } = playerdetailsofput;
  const updatequery = `update cricket_team 
    set player_name='${playerName}',jersey_number=${jerseyNumber},role='${role}'
     where player_id=${playerId}; `;
  await db.run(updatequery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletequery = `delete from cricket_team
    where player_id=${playerId}; `;
  await db.run(deletequery);
  response.send("Player Removed");
});

module.exports = app;
