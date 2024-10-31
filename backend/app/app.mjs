import express, { json } from "express";
const app = express();
import { valideCountry, parcialCountry } from "./schema/schema.mjs";
import { getMongodb } from "./schema/mongo.mjs";
import { date } from "zod";
import cors from "cors"
// import { createRequire } from "node:module";
// const require = createRequire(import.meta.url);
// const countrys = require("../../json/country.json");

app.disable("x-powered-by");
app.use(cors())
app.use(json());

// la conecion con mongodb y obetencion de la colletion
const getCountrys = async () => {
    try {
        const database = await getMongodb();
        const countrys = await database.collection("america").find().toArray();
        // console.table(countrys);
        // console.log(countrys);
        return countrys;
    } catch (error) {
        console.error(error);
    }
};

// para filtrar movies
app.get("/country", async (req, res) => {
    // esto arregla el problema de cors
    // res.header("Access-Control-Allow-Origin", "*");
    const { region } = req.query;
    const countrys = await getCountrys();
    if (region) {
        const filteredregion = countrys.filter((country) =>
            country.region.toLowerCase().includes(region.toLowerCase())
        );
        return res.json(filteredregion);
    }
    return res.json(countrys);
});

//para buscar por id
app.get("/country/:id", async (req, res) => {
    const { id } = req.params;
    const countrys = await getCountrys();
    const country = countrys.find((country) => country._id === parseInt(id));
    if (country) return res.json(country);
    else {
        res.status(404).json({ message: "no encontrado" });
    }
});

// agragar un pais
app.post("/country", async (req, res) => {
    // pero para validar datos con el meto zod
    const valide = valideCountry(req.body);
    const database = await getMongodb();
    const collection = database.collection("america");
    const countrys = await collection.find().toArray();

    if (valide.error) {
        res.status(404).json({ message: JSON.parse(valide.error.message) });
    }

    // se puede asi
    // const { name, age, population, region } = req.body;

    const findid = countrys.length > 0 ? countrys[countrys.length - 1]._id : null;
    const nextid = findid + 1;
    const newCountry = {
        _id: parseInt(nextid),
        ...valide.data,
    };

    await collection.insertOne(newCountry);
    res.status(201).json(newCountry);
});

// actualizacion de un pais
app.patch("/country/:id", async (req, res) => {
    const { id } = req.params;

    //  la validacion de datos
    const valide = parcialCountry(req.body);
    if (valide.error) {
        res.status(404).json({ error: JSON.parse(valide.error.message) });
    }

    const database = await getMongodb();

    const collection = database.collection("america");

    const countryId = parseInt(id);

    const findCountryid = await collection.findOne({ _id: countryId });

    const updateCountry = await collection.updateOne(
        { _id: countryId },
        { $set: valide.data }
    );
    if (updateCountry.modifiedCount === 0) {
        return res.status(400).json({ message: "No se pudo actualizar el país." });
    }

    const updatedCountry = await collection.findOne({ _id: countryId });
    res.status(201).json(updatedCountry);
});

// para borrar un pais
app.delete("/country/:id", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    const { id } = req.params;
    const database = await getMongodb();

    const collection = database.collection("america");

    const countrys = await collection.find().toArray();

    const country = countrys.find((country) => country._id === parseInt(id));

    if (country) {
        const result = await collection.deleteOne(country);
        res.status(200).json({ message: "pais borrado" });
    } else {
        res.status(404).json({ message: "no encontrado" });
    }
});

// en caso que la peticion no se encuentre
app.use((req, res) => {
    res.status(404).send(`<h1>404 no encontrado</h1>`);
});

//llamada de puerto
const port = process.env.port ?? 4000;

app.listen(port, () => {
    console.log(`puerto: ${port}`);
});
