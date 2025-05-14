import { parameters, types } from "../note/note.schema"
import { caller } from "../../router"

describe("Note Controller", () => {
  it("should create notes for multiple zones", async () => {
    const zoneIds = ["66436ad4c75d9b73d988b132", "664a20e49539950ad55f3576"]
    const noteData = {
      zones_id: zoneIds,
      params_ids: [parameters.Enum.ph, parameters.Enum.atmospheric_pressure],
      content: "This is a test note",
      start_date: new Date(),
      end_date: new Date(),
      type: types.Enum.private,
      tag: "TEST_TAG"
    }

    const notes = await caller.note.createNote(noteData)

    expect(notes).toHaveLength(zoneIds.length)
    notes.forEach(note => {
      expect(note).toHaveProperty("content", "This is a test note")
      expect(note).toHaveProperty("type", "private")
    })
  })

  it("should create a note with an older date for each zone", async () => {

    const zoneIds = ["66436ad4c75d9b73d988b132", "664a20e49539950ad55f3576"]
    const oldNoteData = {
      zones_id: zoneIds,
      params_ids: [parameters.Enum.ph, parameters.Enum.atmospheric_pressure],
      content: "This is an old test note",
      start_date: new Date("2023-01-01T00:00:00.000Z"),
      end_date: new Date("2023-01-02T00:00:00.000Z"),
      type: types.Enum.private,
      tag: "OLD_TEST_TAG"
    }

    const notes = await caller.note.createNote(oldNoteData)

    expect(notes).toHaveLength(zoneIds.length)
    notes.forEach(note => {
      expect(note).toHaveProperty("content", "This is an old test note")
      expect(note).toHaveProperty("start_date", new Date("2023-01-01T00:00:00.000Z"))
      expect(note).toHaveProperty("end_date", new Date("2023-01-02T00:00:00.000Z"))
    })
  })

  it("should get all notes", async () => {
    const notes = await caller.note.get({})
    expect(notes).toBeInstanceOf(Array)
  })

  it("should get notes filtered by zones_ids, start_date, and end_date", async () => {
    const filters = {
      zones_ids: ["66436ad4c75d9b73d988b132", "664a20e49539950ad55f3576"],
      start_date: new Date("2023-01-01T00:00:00.000Z"),
      end_date: new Date("2023-01-02T00:00:00.000Z")
    }

    const notes = await caller.note.get(filters)

    expect(notes).toBeInstanceOf(Array)
    if (notes.length > 0) {
      notes.forEach(note => {
        expect(filters.zones_ids).toContain(note.zoneId)
        expect(note.start_date).toBeInstanceOf(Date)
        expect(note.end_date).toBeInstanceOf(Date)
        expect(new Date(note.start_date!).getTime()).toBeGreaterThanOrEqual(filters.start_date.getTime())
        expect(new Date(note.end_date!).getTime()).toBeLessThanOrEqual(filters.end_date.getTime())
      })
    }
  })

  it("should delete a note by id", async () => {
    const zoneId = "66436ad4c75d9b73d988b132"
    const noteData = {
      zones_id: [zoneId],
      params_ids: [parameters.Enum.ph, parameters.Enum.atmospheric_pressure],
      content: "Note to be deleted",
      start_date: new Date(),
      end_date: new Date(),
      type: types.Enum.private,
      tag: "DELETE_TAG"
    }

    const createdNotes = await caller.note.createNote(noteData)

    expect(createdNotes).toHaveLength(1)
    const newNote = createdNotes[0]

    if(!newNote) throw new Error("Failed to create note for deletion test.")

    const noteId = newNote.id
    const deletedNote = await caller.note.deleteNote({ id: noteId })
    expect(deletedNote.id).toBe(noteId)
  })

  it("should update a note by id", async () => {
    const zoneId = "66436ad4c75d9b73d988b132"
    const noteData = {
      zones_id: [zoneId],
      params_ids: [parameters.Enum.ph, parameters.Enum.atmospheric_pressure],
      content: "Note to be updated",
      start_date: new Date(),
      end_date: new Date(),
      type: types.Enum.private,
      tag: "UPDATE_TAG"
    }

    const createdNotes = await caller.note.createNote(noteData)

    expect(createdNotes).toHaveLength(1)
    const newNote = createdNotes[0]

    if (!newNote) {
      throw new Error("Failed to create note for update test.")
    }

    const noteId = newNote.id
    const updateData = {
      id: noteId,
      content: "Updated content",
      tag: "UPDATED_TAG"
    }

    const updatedNote = await caller.note.updateNote(updateData)

    expect(updatedNote.id).toBe(noteId)
    expect(updatedNote.content).toBe("Updated content")
    expect(updatedNote.tag).toBe("UPDATED_TAG")
  })
})
