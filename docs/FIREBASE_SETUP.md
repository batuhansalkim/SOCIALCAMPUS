# Firebase Entegrasyonu

## Genel Bakış

SOCIALCAMPUS uygulaması Firebase ile entegre edilmiştir. Modern bir yapı kullanılarak organize edilmiştir.

## Firebase Servisleri

### 1. Authentication
- Email/Password ile giriş
- Kullanıcı kayıt
- Oturum yönetimi

### 2. Firestore Database
- Kullanıcı profilleri
- Yemek reaksiyonları
- Real-time veri senkronizasyonu

### 3. Storage
- Dosya yükleme (gelecek için hazır)

### 4. Analytics
- Kullanıcı davranışları (gelecek için hazır)

## Dosya Yapısı

```
services/firebase/
├── authService.js      # Authentication işlemleri
├── userService.js      # Kullanıcı veri işlemleri
├── mealService.js      # Yemek reaksiyon işlemleri
└── index.js           # Tüm servisleri export eder

contexts/
└── FirebaseContext.js  # Firebase Context Provider

hooks/
└── useFirebaseAuth.js  # Authentication hook'u

configs/
└── FirebaseConfig.js   # Firebase konfigürasyonu
```

## Kullanım

### Context Kullanımı
```javascript
import { useFirebase } from '../contexts/FirebaseContext';

const { user, userData, loading } = useFirebase();
```

### Authentication Hook
```javascript
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

const { login, register, logout, isAuthenticated } = useFirebaseAuth();
```

### Servis Kullanımı
```javascript
import { userService, mealService } from '../services/firebase';

// Kullanıcı oluştur
await userService.createUser(userId, userData);

// Yemek reaksiyonu ekle
await mealService.addReaction(mealId, userId, 'like');
```

## Güvenlik

Firestore güvenlik kuralları `firebase/firestore.rules` dosyasında tanımlanmıştır:

- Kullanıcılar sadece kendi verilerini okuyabilir/yazabilir
- Yemek reaksiyonları herkes tarafından okunabilir
- Reaksiyon yazma sadece kendi reaksiyonları için

## Cache Stratejisi

- AsyncStorage ile local cache
- 6-24 saat cache süresi
- Otomatik cache temizleme
- Offline destek

## Hata Yönetimi

- Try-catch blokları
- Kullanıcı dostu hata mesajları
- Retry mekanizmaları
- Loading states 