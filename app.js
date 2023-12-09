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
    movieName: theMovie.movie_name,
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

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const putDetails = request.body;
  const { directorId, movieName, leadActor } = putDetails;
  const putQuery = `
    SELECT *
    FROM movie
    WHERE movie_id=${movieId}`;
  const putResponse = await db.run(putQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE FROM movie 
    WHERE movie_id=${movieId}`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

const convertDirector = (directorObj) => {
  return {
    directorId: directorObj.director_id,
    directorName: directorObj.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const directorsQuery = `
    SELECT *
    FROM director`;
  const directorResponse = await db.all(directorsQuery);
  const responsedir = directorResponse.map((eachObj) =>
    convertDirector(eachObj)
  );
  response.send(responsedir);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const query = `
    SELECT *
    FROM movie
    WHERE director_id=${directorId}`;
  const directorMovies = await db.all(query);
  const directorResponseMovie = directorMovies.map((eachdirector) =>
    convertToObj(eachdirector)
  );
  response.send(directorResponseMovie);
});

module.exports = app;
