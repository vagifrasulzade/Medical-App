export type Doctor = {
  id: number;
  fullName?: string;
  name?: string;
  photo?: string;
  specialty: string;
  yearsOfExperience?: number;
  hospitalName?: string;
  consultationFee?: number;
  isVerified?: boolean;
  lat?: number;
  lng?: number;
  distance?: number;
  rating?: number;
  patient?: number;
  reviewCount?: number;
  gender?: "male" | "female";
};
