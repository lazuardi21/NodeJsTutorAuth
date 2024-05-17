const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create and Save a new Tutorial
exports.create = async (req, res) => {
    try {
        // Validate request
        if (!req.body.title) {
            return res.status(400).send({
                message: "Content can not be empty!"
            });
        }

        // Create a Tutorial
        const tutorial = await prisma.tutorial.create({
            data: {
                title: req.body.title,
                description: req.body.description || null,
                published: req.body.published || false
            }
        });

        res.send(tutorial);
    } catch (error) {
        res.status(500).send({
            message: error.message || "Some error occurred while creating the Tutorial."
        });
    }
};

// Retrieve all Tutorials from the database
exports.findAll = async (req, res) => {
    try {
        const tutorials = await prisma.tutorial.findMany();
        res.send(tutorials);
    } catch (error) {
        res.status(500).send({
            message: error.message || "Some error occurred while retrieving tutorials."
        });
    }
};

exports.findAllByFilter = async (req, res) => {
    const title = req.params.title; // Get the title from the query parameter
  
    try {
      const tutorials = await prisma.tutorial.findMany({
        where: {
          title: {
            contains: title || undefined // Use undefined if title is falsy
          }
        }
      });
      res.send(tutorials);
    } catch (error) {
      res.status(500).send({
        message: error.message || "Some error occurred while retrieving tutorials."
      });
    }
  };

// Find a single Tutorial with an id
exports.findOne = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const tutorial = await prisma.tutorial.findUnique({
            where: { id }
        });
        if (tutorial) {
            res.send(tutorial);
        } else {
            res.status(404).send({ message: `Cannot find Tutorial with id=${id}.` });
        }
    } catch (error) {
        res.status(500).send({ message: "Error retrieving Tutorial with id=" + id });
    }
};

// Update a Tutorial by the id in the request
exports.update = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const updatedTutorial = await prisma.tutorial.update({
            where: { id },
            data: req.body
        });
        res.send({ message: "Tutorial was updated successfully.", data: updatedTutorial });
    } catch (error) {
        res.status(500).send({ message: "Error updating Tutorial with id=" + id });
    }
};

// Delete a Tutorial with the specified id in the request
exports.delete = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        await prisma.tutorial.delete({
            where: { id }
        });
        res.send({ message: "Tutorial was deleted successfully!" });
    } catch (error) {
        res.status(500).send({ message: "Could not delete Tutorial with id=" + id });
    }
};

// Delete all Tutorials from the database
exports.deleteAll = async (req, res) => {
    try {
        await prisma.tutorial.deleteMany();
        res.send({ message: "All Tutorials were deleted successfully!" });
    } catch (error) {
        res.status(500).send({ message: "Could not delete all Tutorials." });
    }
};

// Find all published Tutorials
exports.findAllPublished = async (req, res) => {
    try {
        const tutorials = await prisma.tutorial.findMany({
            where: { published: true }
        });
        res.send(tutorials);
    } catch (error) {
        res.status(500).send({
            message: error.message || "Some error occurred while retrieving tutorials."
        });
    }
};
