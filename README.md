# 🏥 Medical App 2

A React Native (Expo) mobile application for finding doctors and hospitals in Baku, Azerbaijan.

---

## 👨‍⚕️ Doctors

The app includes **20 real doctors** from hospitals across Baku. Doctor data is stored in `mobile/data/doctor.js`.

### Data Structure

```js
{
  id: number,
  fullName: string,
  photo: string,           // URL
  specialty: string,
  yearsOfExperience: number,
  hospitalName: string,
  hospitalAddress: string,
  consultationFee: number, // AZN
  isVerified: boolean,
  gender: "male" | "female",
  patient: number,         // total patients seen
  rating: number,          // 0.0 – 5.0
  reviewCount: number,
  lat: number,
  lng: number,
  description: string,
  reviews: [
    { name: string, rating: number, comment: string }
  ]
}
```

### Specialties

| Specialty       | Count |
| --------------- | ----- |
| Cardiologist    | 4     |
| Pediatrician    | 4     |
| Neurologist     | 3     |
| Dentist         | 4     |
| Surgeon         | 2     |
| Therapist       | 2     |
| Ophthalmologist | 1     |

### Doctor List

| #   | Name                 | Specialty    | Hospital                       | Fee (AZN) | Rating |
| --- | -------------------- | ------------ | ------------------------------ | --------- | ------ |
| 1   | Anar Mammadov        | Cardiologist | Baku Medical Plaza             | 60        | ⭐ 4.9 |
| 2   | Lala Hasanova        | Pediatrician | Leyla Medical Center           | 40        | ⭐ 4.8 |
| 3   | Tural Aliyev         | Neurologist  | Yeni Klinika                   | 75        | ⭐ 4.9 |
| 4   | Nigar Agayeva        | Dentist      | EH Dental Klinikası            | 35        | ⭐ 4.6 |
| 5   | Rufat Nazirov        | Surgeon      | MediClub Hospital              | 100       | ⭐ 5.0 |
| 6   | Sabina Ismayilova    | Therapist    | Caspian International Hospital | 50        | ⭐ 4.8 |
| 7   | Elçin Nəsirov        | Cardiologist | Yeni Klinika                   | 65        | ⭐ 4.7 |
| 8   | Günel Əhmədova       | Pediatrician | EGE Hospital                   | 38        | ⭐ 4.5 |
| 9   | Emil Imanov          | Dentist      | PRO Implant Dental Clinic      | 45        | ⭐ 4.8 |
| 10  | Ulviyya Guliyeva     | Neurologist  | MediClub KIDS                  | 55        | ⭐ 4.7 |
| 11  | Rövşən Allahverdiyev | Dentist      | 52 DENT                        | 40        | ⭐ 4.7 |
| 12  | Lala Ragimova        | Pediatrician | Leyla Medical Center           | 42        | ⭐ 4.8 |
| 13  | Vüqar Gülüzadə       | Cardiologist | Modern Hospital                | 70        | ⭐ 4.9 |
| 14  | Farida Huseynzade    | Dentist      | EGE Hospital                   | 48        | ⭐ 4.8 |
| 15  | Nərmin Hüseynova     | Neurologist  | Baku Medical Plaza             | 75        | ⭐ 4.9 |
| 16  | Turan Babayeva       | Therapist    | Mediland Hospital              | 55        | ⭐ 4.8 |
| 17  | Altay Həsənov        | Cardiologist | Istanbul NS Klinikası          | 62        | ⭐ 4.8 |
| 18  | Ulduzə İsgəndərova   | Dentist      | Leyla Medical Center           | 42        | ⭐ 4.7 |
| 19  | Farid Khanmammadov   | Surgeon      | Liv Bona Dea Hospital          | 100       | ⭐ 5.0 |
| 20  | Aytən Ziyadova       | Pediatrician | Universal Hospital             | 75        | ⭐ 4.8 |

---

## 🏥 Hospitals

The app includes **41 hospitals** in Baku stored in `mobile/data/hospital.js`.

### Categories

- **Public** — State / government hospitals (IDs 1–10, 21–25)
- **Private** — Private clinics and hospitals (IDs 11–20, 26–41)

---

## 🚀 Getting Started

```bash
cd mobile
npm install
npx expo start
```

## 📁 Project Structure

```
mobile/
├── app/              # Screens (Expo Router)
│   ├── map.tsx       # Hospital map with nearest slide panel
│   ├── doctor-list.tsx
│   ├── doctor-detail.tsx
│   └── ...
├── data/
│   ├── doctor.js     # 20 doctors
│   └── hospital.js   # 41 hospitals
├── components/       # Shared UI components
├── hooks/            # Custom hooks
└── constant/         # Theme, fonts, API config
```
