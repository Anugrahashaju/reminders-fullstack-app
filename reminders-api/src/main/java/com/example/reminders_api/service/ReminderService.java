package com.example.reminders_api.service;

import com.example.reminders_api.model.Reminder;
import com.example.reminders_api.model.Status;

import java.util.List;
import java.util.Optional;

public interface ReminderService {

    List<Reminder> findAllByUserName(String userName);

    Reminder save(Reminder reminder);

    List<Reminder> findAllByStatus(Status status);

    Optional<Reminder> findById(String id);  // Method to find reminder by ID

    void delete(Reminder reminder);  // Method to delete a reminder
}
