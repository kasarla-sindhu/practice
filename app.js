const express = require("express");
const app = express();
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;
app.use(express.json());

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`SERVER ERROR IS ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
const convertToObj = (eachMovie) => {
  return {
    movieName: eachMovie.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT *
    FROM movie`;
  const moviesArr = await db.all(getMoviesQuery);
  const moviesObj = moviesArr.map((eachMovie) => convertToObj(eachMovie));
  response.send(moviesObj);
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const postQuery = `
    SELECT *
    FROM movie`;
  const postResponse = await db.run(postQuery);
  response.send("Movie Successfully Added");
});

const convert = (theMovie) => {
  return {
    movieId: theMovie.movie_id,
    directorId: theMovie.director_id,
    movieName: theMovie.director_name,
    leadActor: theMovie.lead_actor,
  };
};
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
  SELECT *
  FROM movie
  WHERE movie_id=${movieId}
  `;
  let movieObj = await db.get(getMovieQuery);
  response.send(convert(movieObj));
});
