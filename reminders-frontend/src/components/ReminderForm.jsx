import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";

const ReminderForm = () => {
  const [reminders, setReminders] = useState([]);

  // Fetch reminders for user on mount
  useEffect(() => {
    axios
      .get("http://localhost:9000/api/reminders/u", {
        params: { userName: "ashish" },
      })
      .then((res) => {
        if (res.data.status === "OK") {
          setReminders(res.data.payload);
        }
      })
      .catch((err) => console.error("Error fetching reminders", err));
  }, []);

  // Handle the completion of a reminder
  const markReminderCompleted = async (reminderId) => {
    try {
      const response = await axios.patch(`http://localhost:9000/api/reminders/${reminderId}`, {
        status: "COMPLETED",
      });
      if (response.data.status === "OK") {
        setReminders((prevReminders) =>
          prevReminders.map((reminder) =>
            reminder.id === reminderId ? { ...reminder, status: "COMPLETED" } : reminder
          )
        );
      }
    } catch (error) {
      console.error("Error updating reminder status", error);
    }
  };

  // Handle the deletion of a reminder
  const deleteReminder = async (reminderId) => {
    try {
      const response = await axios.delete(`http://localhost:9000/api/reminders/${reminderId}`);
      if (response.data.status === "OK") {
        setReminders((prevReminders) => prevReminders.filter((reminder) => reminder.id !== reminderId));
      }
    } catch (error) {
      console.error("Error deleting reminder", error);
    }
  };

  const formik = useFormik({
    initialValues: {
      date: "",
      text: "",
      remindMe: false,
    },
    validationSchema: Yup.object({
      date: Yup.date()
        .required("Date is required")
        .min(new Date(), "Date must be in the future"),
      text: Yup.string()
        .required("Reminder text is required")
        .max(100, "Reminder must be 100 characters or less"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await axios.post("http://localhost:9000/api/reminders", {
          text: values.text,
          remindOn: values.date,
          remindMe: values.remindMe,
        });

        if (response.data.status === "CREATED") {
          setReminders((prev) => [...prev, response.data.payload]);
          resetForm();
        }
      } catch (error) {
        console.error("Error saving reminder", error);
      }
    },
  });

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Set a Reminder</h1>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {/* Date Field */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Reminder Date</label>
          <input
            type="date"
            name="date"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.date}
            className="w-full border rounded px-3 py-2"
          />
          {formik.touched.date && formik.errors.date && (
            <p className="text-sm text-red-500">{formik.errors.date}</p>
          )}
        </div>

        {/* Text Field */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Reminder Text</label>
          <input
            type="text"
            name="text"
            placeholder="e.g., Attend meeting"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.text}
            className="w-full border rounded px-3 py-2"
          />
          {formik.touched.text && formik.errors.text && (
            <p className="text-sm text-red-500">{formik.errors.text}</p>
          )}
        </div>

        {/* Remind Me Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="remindMe"
            checked={formik.values.remindMe}
            onChange={formik.handleChange}
            className="mr-2"
          />
          <label className="text-gray-700">Remind Me</label>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Add Reminder
        </button>
      </form>

      {/* Reminder List */}
      {reminders.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">Upcoming Reminders</h2>
          <ul className="space-y-2">
            {reminders.map((r) => (
              <li
                key={r.id}
                className="border-l-4 border-blue-500 bg-gray-100 p-3 rounded"
              >
                <p className="font-medium">{r.text}</p>
                <p className="text-sm text-gray-600">
                  {new Date(r.remindOn).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  Remind Me: {r.remindMe ? "Yes" : "No"} | Status: {r.status}
                </p>

                <div className="mt-2 flex space-x-2">
                  {/* Mark as Completed Button */}
                  {r.status !== "COMPLETED" && (
                    <button
                      onClick={() => markReminderCompleted(r.id)}
                      className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                    >
                      Mark as Completed
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteReminder(r.id)}
                    className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ReminderForm;
