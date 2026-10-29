# Spider-Verse Gear - Multiverse Raid Resource Planner

**Coursework:** ICT600 Individual Assignment  
**Student Name:** Muhamad Aiman Bin Zulmahjedi  
**Matric No.:** 2024669362  
**Class Group:** CDCS2405A  
**Visual Theme:** Spider-Man Comic Style (Red `#e23636`, Dark Blue `#0a2a6b`, Accent Yellow `#ffd400`, Paper `#f6f3ee`, Black `#14141c`)  

---

## 1. Project Directory Structure
```
D:\AI Class\ICT600 Assignment 1\
├── index.html          (Page 1: Hero Pitch & Founder Profile)
├── kiosk.html          (Page 2: Multiverse Raid Resource Planner Kiosk)
├── README.md           (Image Manifest & Project Documentation)
├── css/
│   └── style.css       (Pure CSS3 Comic-Book Styling, Responsive Grid & Flexbox)
├── js/
│   └── script.js       (Vanilla JavaScript DOM Form Handling, Validation, & Supply Logic)
└── images/
    ├── profile.jpg     (Founder profile portrait)
    ├── heroes/         (Hero character square portraits)
    └── bosses/         (Boss villain square portraits)
```

---

## 2. Required Image Filenames to Add

When real artwork is added, place square images (`jpg`) into these exact directories. The application includes automatic fallback handlers that display stylish comic initial boxes if any image is missing or loading fails:

### Founder Profile (`images/`)
* `images/profile.jpg` - Founder / Lead Developer photo (Muhamad Aiman Bin Zulmahjedi)

### Spider-Heroes (`images/heroes/`)
1. `images/heroes/miles.jpg` - Miles Morales
2. `images/heroes/gwen.jpg` - Spider-Gwen
3. `images/heroes/miguel.jpg` - Miguel O'Hara (Spider-Man 2099)
4. `images/heroes/noir.jpg` - Spider-Man Noir
5. `images/heroes/peni.jpg` - Peni Parker & SP//dr

### Multiverse Bosses (`images/bosses/`)
* **Easy Tier:**
  1. `images/bosses/shocker.jpg`
  2. `images/bosses/chameleon.jpg`
  3. `images/bosses/tombstone.jpg`
* **Normal Tier:**
  4. `images/bosses/rhino.jpg`
  5. `images/bosses/electro.jpg`
  6. `images/bosses/mysterio.jpg`
* **Hard Tier:**
  7. `images/bosses/doctor-octopus.jpg`
  8. `images/bosses/venom.jpg`
  9. `images/bosses/sandman.jpg`
* **Very Hard Tier:**
  10. `images/bosses/green-goblin.jpg`
  11. `images/bosses/carnage.jpg`
  12. `images/bosses/kraven.jpg`
* **Hardcore Tier:**
  13. `images/bosses/morlun.jpg`
  14. `images/bosses/knull.jpg`
  15. `images/bosses/mephisto.jpg`

---

## 3. Mathematical Formula & Pricing Rules
* **Per hero per day** = Tier figure + Strategy extra
* **Each hero carries** = Per hero per day &times; Number of days
* **Squad total** = Each hero carries &times; Number of heroes
* **Total Cost** = (Squad total &times; Item price) + (Power-up price &times; Number of heroes)

### Unit Rates:
* **Med-Gel:** RM 5.00 / unit
* **Web-Fluid:** RM 8.00 / unit
* **Shield Charge:** RM 15.00 / unit
* **Revive Serum:** RM 60.00 / hero
* **Web-Shooter Upgrade:** RM 80.00 / hero
* **Spider-Armor Plating:** RM 100.00 / hero

