# 📤 Инструкции по публикации на GitHub

## ✅ Что уже готово

Локальный репозиторий успешно инициализирован с первым коммитом `v1.0.0`.

**Файлы в репе:**
- ✅ `index.html` - основная игра
- ✅ `README.md` - полная документация
- ✅ `.gitignore` - игнорирование файлов
- ✅ Commit: `🎮 Initial release v1.0.0 - Minecraft Doom: BOSS UPDATE`

---

## 🚀 Шаги для публикации на GitHub

### 1️⃣ Создать репозиторий на GitHub

1. Откройте https://github.com/new
2. Заполните форму:
   - **Repository name**: `minecraft-doom` (или на ваше усмотрение)
   - **Description**: "Retro FPS game built with raycasting engine"
   - **Visibility**: Public (чтобы все могли видеть)
   - **Initialize this repository with**: Оставьте пусто (у нас уже есть код)
3. Нажмите "Create repository"

### 2️⃣ Добавить удаленный репозиторий

После создания Гитхаб покажет команды. Используйте эту:

```bash
cd /Users/dobrik/Sites/daamm.html
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/minecraft-doom.git
git push -u origin main
```

**Замените `YOUR_USERNAME` на вашу учетную запись GitHub**

### 3️⃣ Создать Release на GitHub

После успешного пуша:

1. Откройте репозиторий на GitHub
2. Нажмите на "Releases" в боковой панели (или перейдите сюда: `https://github.com/YOUR_USERNAME/minecraft-doom/releases`)
3. Нажмите "Create a new release"
4. Заполните:
   - **Choose a tag**: `v1.0.0`
   - **Release title**: `Minecraft Doom - BOSS UPDATE`
   - **Description**: 
   ```
   🎮 Initial Release - Minecraft Doom: BOSS UPDATE
   
   Features:
   - 3D Raycasting Engine (Wolfenstein 3D style)
   - Dual Weapon System (Shotgun & Rifle)
   - Multiple Enemy Types (Creeper, Skeleton, Boss)
   - Score System
   - Smooth Animations & Effects
   
   [Play Now](https://github.com/YOUR_USERNAME/minecraft-doom/blob/main/index.html)
   ```
5. Нажмите "Publish release"

---

## 📋 Проверка статуса

Чтобы проверить статус локального репо:

```bash
cd /Users/dobrik/Sites/daamm.html
git status
git log --oneline
git remote -v
```

---

## 🎯 Готово!

При успешной публикации вы сможете:
- ✅ Поделиться ссылкой на репо: `https://github.com/YOUR_USERNAME/minecraft-doom`
- ✅ Посмотреть Release: `https://github.com/YOUR_USERNAME/minecraft-doom/releases/tag/v1.0.0`
- ✅ Играть онлайн через GitHub Pages (можно настроить отдельно)

---

**Вопросы?** Убедитесь, что:
- Git установлен (`git --version`)
- GitHub аккаунт создан
- SSH ключи настроены (или используем HTTPS с PAT)
