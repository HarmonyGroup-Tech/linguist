# Linguist - Setup & Testing Guide

## Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Firebase Account** - [Create free account](https://firebase.google.com/)
- **Git** (optional) - For version control

---

## Initial Setup

### 1. Install Dependencies

```bash
cd c:\Users\egeli\Desktop\Linguist
npm install
```

### 2. Firebase Configuration

The project already has Firebase configured in `src/config/firebase.ts`. Make sure you have these environment variables or they're defined in your Firebase config:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

### 3. Deploy Firestore Security Rules

```bash
firebase deploy --only firestore:rules
```

This will deploy the updated rules from `firestore.rules` that include permissions for lessons and userSkills.

---

## Creating Your First Admin User

### Method 1: Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database**
4. Find the `users` collection
5. Locate your user document (use your Firebase Auth UID)
6. Click "Edit" and add a new field:
   - **Field**: `role`
   - **Type**: `string`
   - **Value**: `admin`
7. Save the document

### Method 2: During Signup (Optional)

You can modify the signup flow in `src/pages/Login.tsx` to automatically set admin role for a specific email:

```typescript
// After creating user
if (userCredential.user.email === 'your-admin@email.com') {
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    role: 'admin',
    email: userCredential.user.email,
    createdAt: new Date()
  });
}
```

---

## Running the Application

### Development Server

```bash
npm run dev
```

The app will start at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

---

## Testing the Lesson System

### Admin Testing Workflow

1. **Login as Admin**
   - Go to `http://localhost:5173/login`
   - Sign in with your admin account
   - You should be automatically redirected to `/admin`

2. **Create First Lesson (Beginner)**
   - Click "New Lesson"
   - Fill in:
     - **Title**: "Basic Greetings"
     - **Description**: "Learn to say hello and goodbye"
     - **Language**: Spanish
     - **Level**: 1
     - **Context**: "Hola, ¿cómo estás? Estoy bien, gracias. Adiós."
     - **Target Sentence**: "Hola, ¿cómo estás?"
     - **Correct Translation**: "Hello, how are you?"
     - **Prerequisites**: All set to 0 (accessible to all learners)
     - **Rewards**: 
       - XP: 50
       - Vocabulary: 5
       - Grammar: 3
       - Reading: 4
       - Writing: 3
   - Toggle "Active/Published" to ON
   - Click "Save Lesson"

3. **Create Second Lesson (Intermediate)**
   - Title: "Ordering Food"
   - Level: 3
   - Prerequisites: Vocabulary: 15, Grammar: 10, Reading: 10, Writing: 10
   - Higher skill rewards (8-10 per skill)

4. **Create Third Lesson (Advanced)**
   - Title: "Literary Text"
   - Level: 7
   - Prerequisites: All skills at 40+
   - Maximum skill rewards (15-20 per skill)

5. **Test Editing**
   - Click edit icon on any lesson
   - Modify the description
   - Save and verify changes

6. **Test Filtering**
   - Click "Active" filter - should show only active lessons
   - Click "Drafts" filter - should show only draft lessons
   - Click "All" - should show everything

### Learner Testing Workflow

1. **Create Test Learner Account**
   - Log out from admin
   - Go to `/login?mode=signup`
   - Create new account (this will be a learner by default)

2. **View Initial State**
   - Should see 4 skill cards all at **Level 0**
   - Should only see lessons with 0 prerequisites
   - Other lessons should be locked 🔒

3. **Complete First Lesson**
   - Click on available lesson (yellow with glow)
   - Read the context
   - Type translation in the text box
   - Click "Submit Translation"
   - Watch for:
     - ✅ Success animation
     - 🎉 Level-up celebration notification
     - Skills increase in progress bars
     - Return to dashboard

4. **Verify Progression**
   - Skills should have increased (e.g., Vocabulary: 5, Grammar: 3, etc.)
   - Completed lesson should show ✅ green checkmark
   - Check if any new lessons unlocked
   - XP in header should have increased

5. **Test Prerequisite Locking**
   - Try clicking a locked lesson
   - Should not be clickable
   - Hover to see prerequisite requirements

6. **Test Streak System**
   - Complete a lesson today
   - Check streak counter in header
   - Come back tomorrow and complete another
   - Streak should increment

---

## Sample Test Lessons

### Lesson 1: Absolute Beginner
```
Title: "Meeting Someone New"
Language: Spanish
Level: 1
Order: 1

Context: "Me llamo María. ¿Cómo te llamas? Mucho gusto. Soy de España."
Target: "¿Cómo te llamas?"
Translation: "What is your name?"

Prerequisites: 0/0/0/0
Rewards: XP 50, V+5, G+3, R+4, W+3
Active: Yes
```

### Lesson 2: Beginner
```
Title: "Numbers and Counting"
Language: Spanish
Level: 2
Order: 2

Context: "Uno, dos, tres, cuatro, cinco. Tengo cinco libros. ¿Cuántos libros tienes?"
Target: "Tengo cinco libros."
Translation: "I have five books."

Prerequisites: 10/5/5/5
Rewards: XP 75, V+8, G+5, R+6, W+6
Active: Yes
```

### Lesson 3: Intermediate
```
Title: "Past Tense Practice"
Language: Spanish
Level: 5
Order: 3

Context: "Ayer fui al mercado. Compré frutas y verduras. También hablé con mis amigos."
Target: "Ayer fui al mercado."
Translation: "Yesterday I went to the market."

Prerequisites: 30/25/20/20
Rewards: XP 100, V+10, G+15, R+10, W+12
Active: Yes
```

---

## Common Issues & Solutions

### 1. "Cannot find module 'react'" errors
**Solution**: These are TypeScript IntelliSense errors during development. They will disappear when you run `npm run dev`.

### 2. Admin route not accessible
**Solution**: 
- Verify admin user has `role: 'admin'` in Firestore `users` collection
- Clear browser cache and cookies
- Log out and log back in

### 3. Skills not updating after lesson completion
**Solution**:
- Check browser console for errors
- Verify Firestore rules are deployed
- Ensure `userSkills` collection has correct permissions

### 4. Lessons not showing up
**Solution**:
- Make sure lessons are set to "Active" in admin dashboard
- Check that at least one lesson has all prerequisites at 0
- Verify lessons are being created in Firestore

### 5. "Permission denied" errors
**Solution**:
- Deploy Firestore security rules: `firebase deploy --only firestore:rules`
- Check that user is authenticated
- Verify user document exists in `users` collection

---

## Firestore Collections Structure

After testing, your Firestore should have:

### `users`
```
users/
  {userId}/
    email: string
    role: 'learner' | 'client' | 'admin'
    createdAt: timestamp
```

### `lessons`
```
lessons/
  {lessonId}/
    title: string
    description: string
    language: string
    level: number
    context: string
    targetSentence: string
    correctTranslation: string
    requiredVocabulary: number
    requiredGrammar: number
    requiredReading: number
    requiredWriting: number
    xpReward: number
    vocabularyGain: number
    grammarGain: number
    readingGain: number
    writingGain: number
    createdBy: string
    isActive: boolean
    order: number
    createdAt: timestamp
```

### `userSkills`
```
userSkills/
  {userId}/
    userId: string
    vocabulary: number
    grammar: number
    reading: number
    writing: number
    totalXP: number
    streak: number
    lastPracticeDate: string
    completedLessons: string[]
```

---

## Performance Tips

1. **Firestore Indexes**: If you have many lessons, create a composite index:
   - Collection: `lessons`
   - Fields: `isActive` (Ascending), `order` (Ascending)

2. **Lazy Loading**: For 100+ lessons, implement pagination in lesson path

3. **Caching**: User skills are loaded once per session, reducing reads

---

## Next Steps After Testing

1. ✅ Verify all 3 user types work (learner, client, admin)
2. ✅ Create at least 5 demo lessons across difficulty levels
3. ✅ Test complete learner progression from 0 to 50+ in one skill
4. ✅ Verify locked lessons unlock at correct thresholds
5. ✅ Test streak system over 2 days
6. ✅ Verify admin can edit and delete lessons
7. ✅ Test on mobile responsive view

---

## Deployment Checklist

When ready to deploy to production:

- [ ] Set up environment variables in Netlify
- [ ] Deploy Firestore rules
- [ ] Create production admin user
- [ ] Seed production database with lessons
- [ ] Test in production environment
- [ ] Set up Firebase App Check for security
- [ ] Configure custom domain (if applicable)

---

## Support

If you encounter issues:

1. Check browser console for errors
2. Verify Firestore rules are deployed
3. Ensure all dependencies are installed (`npm install`)
4. Check Firebase project configuration
5. Review the [walkthrough.md](file:///C:/Users/egeli/.gemini/antigravity/brain/9f97cafc-7bc0-46af-8fba-4443650e1736/walkthrough.md) for detailed feature documentation

---

**Happy Teaching! 🎓📚**
