const express = require('express')
const router = express.Router()
const contactsModel = require("../../models/contacts")

router.get('/', async (req, res, next) => {
  try {
    const contacts = await contactsModel.listContacts()
    res.json(contacts)
  } catch (error) {
    next(error)
  }
})

router.get('/:contactId', async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const contact = await contactsModel.getContactById(contactId);
    res.json(contact);
  } catch (error) {
    next(error);
  }
});


router.delete('/:contactId', async (req, res, next) => {
  try {
    const contactId = req.params.contactId
    const updatedContacts = await contactsModel.removeContact(contactId)
    res.json({ message: 'Contact deleted successfully', contacts: updatedContacts })
  } catch (error) {
    next(error)
  }
})


router.post('/', async (req, res, next) => {
  try {
    const newContact = await contactsModel.addContact(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
});



router.put('/:contactId', async (req, res, next) => {
  try {
    const contactId = req.params.contactId
    const updatedContact = await contactsModel.updateContact(contactId, req.body)
    res.json(updatedContact)
  } catch (error) {
    next(error)
  }
})

module.exports = router
