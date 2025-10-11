import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    family: { type: String, required: true },
    birthDate: String,
    birthPlace: String,
    residenceAddress: String,
    phoneHome: String,
    mobile: String,
    workAddressPhone: String,
    email: { type: String, required: true },
    gender: String,
    maritalStatus: String,
    childrenCount: String,
    religion: String,
    militaryStatus: String,
    educations: [
      {
        institute: String,
        startDate: String,
        endDate: String,
        major: String,
        degree: String,
      },
    ],
    languages: [
      {
        name: String,
        reading: String,
        writing: String,
      },
    ],
    skills: String,
    jobRequested: String,
    jobExperienceDuration: String,
    willingToWorkIn: String,
    monthsPerYearInOtherCity: String,
    workHistories: [
      {
        period: String,
        company: String,
        activityType: String,
        employeesCount: String,
        manager: String,
        position: String,
        supervisedCount: String,
        salaryStart: String,
        salaryEnd: String,
        description: String,
        reasonForLeaving: String,
      },
    ],
    currentlyEmployed: String,
    reasonSearching: String,
    okToContactCurrentEmployer: String,
    referees: [
      {
        name: String,
        workplace: String,
        position: String,
        phone: String,
      },
    ],
    otherInfo: String,
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileMime: { type: String, required: true },
    fileSize: { type: Number, required: true },
    generatedPdfPath: String,
    status: {
      type: String,
      enum: ["new", "reviewed", "archived"],
      default: "new",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Resume", resumeSchema);
