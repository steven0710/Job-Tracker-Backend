import { Response } from "express";
import { Job } from "../models/jobs.model";
import { AuthRequest } from "../types/auth-request";
import { createJobSchema, updateJobSchema } from "../validators/job.validator";

export const createJob = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const parsed = createJobSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        issues: parsed.error.issues,
        formErrors: parsed.error.flatten().formErrors,
        fieldErrors: parsed.error.flatten().fieldErrors,
      });
    }

    // Create job with userId attached
    const job = await Job.create({
      ...parsed.data,
      userId: req.user.userId,
    });

    res.status(201).json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllJobs = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const jobs = await Job.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    }); // Sort by most recent
    return res.status(200).json({ message: "Jobs retrieved", jobs: jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getJobById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const getJob = await Job.findOne({
      _id: req.params.id,
      userId: req.user.userId, // Ensure the job belongs to the authenticated user
    });

    if (!getJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json({ message: "Job retrieved", job: getJob });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateJob = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const parsed = updateJobSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        issues: parsed.error.issues, // includes unrecognized_keys
        formErrors: parsed.error.flatten().formErrors,
        fieldErrors: parsed.error.flatten().fieldErrors,
      });
    }

    const updatedJob = await Job.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { $set: parsed.data },
      { returnDocument: "after", runValidators: true },
    );

    if (!updatedJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json({ message: "Job updated", job: updatedJob });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteJob = async (req: AuthRequest, res: Response) => {
  try {
    // const { title, company, employmentType, status } = req.body;

    if (!req.user?.userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // console.log(req.params.id);
    // console.log(req.user.userId);
    const deleteJob = await Job.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId, // Ensure the job belongs to the authenticated user
    });

    if (!deleteJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json({ message: "Job deleted", job: deleteJob });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
