const fs = require('fs').promises;
const path = require('path');
const nanoid = require('nanoid')
const Joi = require('joi');

const contactsPath = path.join(__dirname, 'contacts.json');

const contactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required()
});

const listContacts = async () => {
  try {
    const data = await fs.readFile(contactsPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading contacts.json:", error);
    throw error;
  }
}


const getContactById = async (contactId) => {
  try {
    const contacts = await listContacts();
    const foundContact = contacts.find(contact => contact.id === contactId);

    if (foundContact) {
      return foundContact;
    } else {
      throw new Error('Contact not found');
    }
  } catch (error) {
    console.error("Error getting contact by ID:", error);
    throw error;
  }
}

const removeContact = async (contactId) => {
  try {
    const contacts = await listContacts();
    const updatedContacts = contacts.filter(contact => contact.id !== contactId);
    const contactDeleted = contacts.length !== updatedContacts.length;

    if (contactDeleted) {
      await fs.writeFile(contactsPath, JSON.stringify(updatedContacts, null, 2));
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Contact removing error", error)
    throw error
  }
}



const addContact = async (body) => {
  try {

    const { name, email, phone } = body;
    const { error } = contactSchema.validate({ name, email, phone });

    if (error) {
      const errorMessage = "Validation error: " + error.details.map(detail => detail.message).join(', ');
      throw { status: 400, message: errorMessage };
    }
    const contacts = await listContacts();
    const newContact = {
      id: nanoid.nanoid(),
      name,
      email,
      phone,
    };

    contacts.push(newContact);

    await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));

    return newContact;

  } catch (error) {
    console.error("Error adding contact:", error);
    throw error;
  }
}


const updateContact = async (contactId, body) => {
  try {
    const contactToUpdate = contacts.find((contact) => contact.id === contactId)

    if (!contactToUpdate) {
      throw { status: 404, message: "Contact not found" }
    }

    const { error } = contactSchema.validate(body);

    if (error) {
      const errorMessage = "Validation error: " + error.details.map(detail => detail.message).join(', ');
      throw { status: 400, message: errorMessage };
    }

    const contacts = await listContacts()
    const updatedContact = {
      ...contactToUpdate,
      ...body,
    }

    const updatedContacts = contacts.map((contact) =>
      contact.id === contactId ? updatedContact : contact)

    await fs.writeFile(contactsPath, JSON.stringify(updatedContacts, null, 2))
    return updatedContact

  } catch (error) {
    console.error('Error updating contact:', error)
    throw error
  }
}


module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}
