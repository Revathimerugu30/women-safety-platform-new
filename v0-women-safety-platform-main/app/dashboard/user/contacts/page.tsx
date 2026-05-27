'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiPlus, FiPhone, FiTrash2, FiUser, FiEdit2 } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface Contact {
  id: string
  name: string
  phone: string
  relationship: string
}

const initialContacts: Contact[] = [
  { id: '1', name: 'Mom', phone: '+1234567890', relationship: 'Mother' },
  { id: '2', name: 'Dad', phone: '+1987654321', relationship: 'Father' },
]

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [showForm, setShowForm] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingContact) {
      setContacts(contacts.map((c) =>
        c.id === editingContact.id
          ? { ...c, ...formData }
          : c
      ))
      toast.success('Contact updated')
    } else {
      const newContact: Contact = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
      }
      setContacts([...contacts, newContact])
      toast.success('Contact added')
    }

    setFormData({ name: '', phone: '', relationship: '' })
    setShowForm(false)
    setEditingContact(null)
  }

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact)
    setFormData({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
    })
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id))
    toast.success('Contact removed')
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Emergency Contacts</h1>
          <p className="text-muted-foreground">
            Manage contacts who will be notified in emergencies
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingContact(null)
            setFormData({ name: '', phone: '', relationship: '' })
          }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          <span className="hidden sm:inline">Add Contact</span>
        </button>
      </motion.div>

      {/* Add/Edit form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="font-semibold mb-4">
            {editingContact ? 'Edit Contact' : 'Add New Contact'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contact name"
                  required
                  className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1234567890"
                  required
                  className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Relationship</label>
                <input
                  type="text"
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  placeholder="e.g., Mother, Friend"
                  required
                  className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all"
              >
                {editingContact ? 'Update' : 'Add Contact'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingContact(null)
                }}
                className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Contact list */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-4"
      >
        {contacts.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <FiUser className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No contacts yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add emergency contacts to notify them during emergencies
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all"
            >
              Add First Contact
            </button>
          </div>
        ) : (
          contacts.map((contact, index) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="glass-card rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <FiUser className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <FiPhone className="w-3 h-3" />
                    {contact.phone}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${contact.phone}`}
                  className="p-2 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-all"
                >
                  <FiPhone className="w-5 h-5" />
                </a>
                <button
                  onClick={() => handleEdit(contact)}
                  className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-all"
                >
                  <FiEdit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  )
}
