import express from "express";
import { PrismaClient } from "@prisma/client";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";


const port = 3000;
const app = express();
const prisma = new PrismaClient();


app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/movies", async (_, res) => {
    const movies = await prisma.movie.findMany({
        orderBy: {
            title: "asc"
        },

        include: {
            genres: true,
            languages: true
        }
    });
    res.json(movies);
});

app.post("/movies", async (req, res) => {

    const { title, genre_id, language_id, oscar_count, release_date } = req.body;

    try {

        const movieWitchSameTitle = await prisma.movie.findFirst({
            where: {
                title: { equals: title, mode: "insensitive" }
            }
        });

        if (movieWitchSameTitle) {
            return res.status(409).send({ message: "Já existe um filme cadastrado com esse titulo" });
        }

        await prisma.movie.create({
            data: {
                title: title,
                genre_id: genre_id,
                language_id: language_id,
                oscar_count: oscar_count,
                release_date: new Date(release_date)
            }
        });

    } catch (error) {
        return res.status(500).send({ message: "Falha ao cadastrar o filme" });
    }

    res.status(201).send();

});

app.put("/movies/:id", async (req, res) => {
    const id = Number(req.params.id);

    await prisma.movie.update({
        where: {
            id
        },
        data: {
            release_date: new Date(req.body.release_date)
        }
    });

    res.status(200).send();
});

app.delete("/movies/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {
        const movie = await prisma.movie.findUnique({ where: { id } });

        if (!movie) {
            return res.status(404).send({ message: "O filme não foi encontrado" });
        };

        await prisma.movie.delete({ where: { id } });

    } catch (error) {
        return res.status(500).send({ message: "Não foi possivel remover o filme" });
    }

    res.status(200).send();
});

app.get("/movies/:genreName", async (req, res) => {

    try {
        const movisFilteredByGenreName = await prisma.movie.findMany({
            include: {
                genres: true,
                languages: true
            },
            where: {
                genres: {
                    name: {
                        equals: req.params.genreName,
                        mode: "insensitive"
                    }
                }
            }
        });

        res.status(200).send(movisFilteredByGenreName);

    } catch (error) {
        return res.status(500).send({ message: "fala ao filtar dilmes por genro" });
    }
});

app.listen(port, () => {
    console.log(`Servidor em execução na porta ${port}`);
});

