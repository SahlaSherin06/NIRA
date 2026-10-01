export interface OnboardingData {
  // Step 1
  dob?: string;
  height?: string;
  weight?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  haveChildren?: string;
  numberOfChildren?: string;
  // Step 2
  nationality?: string;
  grewUpIn?: string;
  city?: string;
  state?: string;
  country?: string;
  religion?: string;
  caste?: string;
  ethnicity?: string;
  motherTongue?: string;
  // Step 3
  educationLevel?: string;
  profession?: string;
  annualIncome?: string;
  // Step 4
  diet?: string; 
  dressingSense?: string;
  smoke?: string;
  drink?: string;
  // Step 5
  personality?: string[];
  interests?: string[];
  bio?: string;
  // Step 6
  whatBringsYouHere?: string;
  knowSomeoneFor?: string;
  marryWithin?: string;
  moveAbroad?: string;
  // Step 7 - Partner Preferences
  prefAgeMin?: string;
  prefAgeMax?: string;
  prefHeightMin?: string;
  prefHeightMax?: string;
  prefMaritalStatus?: string[];
  prefLocation?: string;
  prefEducation?: string;
  prefProfession?: string;
  prefReligion?: string;
  prefSmoking?: string;
  prefDrinking?: string;
  prefDiet?: string;
  prefValues?: string[];
  // Step 8
  mainPhoto?: string;
  galleryPhotos?: string[];
  photoPrivacy?: string;
  // Step 9
  promisesAccepted?: boolean;
}
