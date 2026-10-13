import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useStudio } from "./store/useStudio.js";
import { SHOWROOM_ROOM } from "./lib/navigation.js";
import {
  byId,
  DOOR_STYLES,
  DOOR_COLORS,
  COUNTERTOPS,
  HANDLES,
  HANDLE_FINISHES,
  APPLIANCE_FINISHES,
  LED_PRESETS,
} from "./data/catalog.js";
import {
  IconArrowLeft,
  IconCube,
  IconDoor,
  IconEye,
  IconLayers,
  IconPalette,
  IconWardrobe,
  IconLamp,
  IconX,
  IconCamera,
  IconRotate,
  IconCheck,
  IconRoom,
  IconHandle,
} from "./ui/icons.jsx";
import hero from "./assets/showroom.jpg";
import "./styles/customer.css";

const SceneView = lazy(() => import("./ui/SceneView.jsx"));
const STYLES = [
  {
    name: "مدرن",
    desc: "سادگی، با جزئیات متفاوت",
    style: "mdf",
    color: "greige",
    counter: "nero",
    tone: "modern",
  },
  {
    name: "کلاسیک",
    desc: "گرمای یک خانه‌ی اصیل",
    style: "membrane",
    color: "cream",
    counter: "quartz-sand",
    tone: "classic",
  },
  {
    name: "نئوکلاسیک",
    desc: "تعادل زیبایی و ظرافت",
    style: "neoclassic",
    color: "ivory",
    counter: "calacatta",
    tone: "neo",
  },
];

function Brand() {
  return (
    <span className="customer-brand" dir="ltr">
      <span className="brand-symbol">
        D<span>▪</span>
      </span>
      <span>
        DECOTECK<small>INTERIOR DESIGN & CABINET</small>
      </span>
    </span>
  );
}

export function CustomerPanel({ onClose }) {
  const [tab, setTab] = useState("material");
  const s = useStudio();
  const wardrobe = s.mode === "wardrobe";
  const values = wardrobe ? s.wardrobe : s.kitchen;
  const update = wardrobe ? s.setWardrobe : s.setKitchen;
  const tabs = [
    ["material", "متریال", IconLayers],
    ["color", "رنگ", IconPalette],
    ["handle", "یراق", IconHandle],
    ["light", "نور", IconLamp],
  ];
  const choices = (options, value, action, colored = false) => (
    <div className={`customer-choices ${colored ? "colors" : ""}`}>
      {options.map((o) => (
        <button
          key={o.id}
          aria-pressed={value === o.id}
          className={value === o.id ? "chosen" : ""}
          onClick={() => action(o)}
        >
          {colored && <i style={{ background: o.hex || "#a29b8e" }} />}
          <span>{o.name}</span>
          {value === o.id && <IconCheck size={15} />}
        </button>
      ))}
    </div>
  );
  return (
    <aside className="customer-panel" aria-label="انتخاب ظاهر">
      <div className="customer-panel-head">
        <div>
          <small>YOUR SIGNATURE</small>
          <h2>به سلیقه‌ی شما</h2>
        </div>
        <button
          className="round-button"
          onClick={onClose}
          aria-label="بستن پنل"
        >
          <IconX />
        </button>
      </div>
      <div className="customer-tabs" role="tablist">
        {tabs.map(([id, name, Icon]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
          >
            <Icon size={17} />
            {name}
          </button>
        ))}
      </div>
      <div className="customer-panel-body" role="tabpanel">
        {tab === "material" && (
          <>
            <h3>سبک درب {wardrobe ? "کمد" : "کابینت"}</h3>
            {choices(DOOR_STYLES, values.doorStyle, (o) =>
              update({ doorStyle: o.id }),
            )}
            {!wardrobe && (
              <>
                <h3>صفحه کابینت و جزیره</h3>
                {choices(
                  COUNTERTOPS,
                  s.kitchen.counter,
                  (o) => s.setKitchen({ counter: o.id }),
                  true,
                )}
              </>
            )}
          </>
        )}
        {tab === "color" && (
          <>
            <h3>رنگ درب‌ها</h3>
            {choices(
              DOOR_COLORS,
              values.doorColor,
              (o) => update({ doorColor: o.id }),
              true,
            )}
            {!wardrobe && (
              <>
                <h3>رنگ لوازم آشپزخانه</h3>
                {choices(
                  APPLIANCE_FINISHES,
                  s.kitchen.applianceFinish,
                  (o) => s.setKitchen({ applianceFinish: o.id }),
                  true,
                )}
              </>
            )}
          </>
        )}
        {tab === "handle" && (
          <>
            <h3>مدل دستگیره</h3>
            {choices(HANDLES, values.handle, (o) => update({ handle: o.id }))}
            <h3>رنگ دستگیره</h3>
            {choices(
              HANDLE_FINISHES,
              values.handleFinish,
              (o) => update({ handleFinish: o.id }),
              true,
            )}
          </>
        )}
        {tab === "light" && (
          <>
            <h3>نورپردازی فضا</h3>
            <button
              className="customer-toggle"
              aria-pressed={s.lighting.led}
              onClick={() => s.setLighting({ led: !s.lighting.led })}
            >
              نور مخفی LED <span>{s.lighting.led ? "روشن" : "خاموش"}</span>
            </button>
            <button
              className="customer-toggle"
              aria-pressed={s.lighting.night}
              onClick={() => s.setLighting({ night: !s.lighting.night })}
            >
              حالت شب <span>{s.lighting.night ? "فعال" : "غیرفعال"}</span>
            </button>
            <h3>رنگ نور</h3>
            {choices(
              LED_PRESETS,
              s.lighting.ledColor,
              (o) => s.setLighting({ ledColor: o.hex }),
              true,
            )}
            <label className="customer-intensity">
              شدت نور
              <input
                aria-label="شدت نور"
                type="range"
                min="0.1"
                max="2.5"
                step="0.1"
                value={s.lighting.ledIntensity}
                onChange={(e) =>
                  s.setLighting({ ledIntensity: +e.target.value })
                }
              />
            </label>
            <button
              className="customer-toggle"
              aria-pressed={s.ui.effects !== false}
              onClick={() => s.setUI({ effects: s.ui.effects === false })}
            >
              کیفیت جلوه‌ها{" "}
              <span>{s.ui.effects === false ? "سبک" : "بالا"}</span>
            </button>
          </>
        )}
      </div>
      <p className="customer-panel-foot">
        فضا آماده است؛ فقط ظاهر دلخواهتان را انتخاب کنید.
      </p>
    </aside>
  );
}

function MovementPad() {
  const move = useStudio((s) => s.ui.move);
  const setUI = useStudio((s) => s.setUI);
  const press = (key, value) =>
    setUI({ move: { ...useStudio.getState().ui.move, [key]: value } });
  return (
    <div className="movement-pad" aria-label="کنترل حرکت داخل فضا" dir="ltr">
      {[
        ["forward", "↑", "جلو"],
        ["left", "←", "چپ"],
        ["back", "↓", "عقب"],
        ["right", "→", "راست"],
      ].map(([key, arrow, label]) => (
        <button
          key={key}
          className={`${key} ${move?.[key] ? "pressed" : ""}`}
          aria-label={`حرکت به ${label}`}
          onPointerDown={(e) => {
            e.preventDefault();
            e.currentTarget.setPointerCapture(e.pointerId);
            press(key, true);
          }}
          onPointerUp={() => press(key, false)}
          onPointerCancel={() => press(key, false)}
          onLostPointerCapture={() => press(key, false)}
          onKeyDown={(e) => {
            if ([" ", "Enter"].includes(e.key)) {
              e.preventDefault();
              press(key, true);
            }
          }}
          onKeyUp={() => press(key, false)}
          onBlur={() => press(key, false)}
        >
          {arrow}
        </button>
      ))}
    </div>
  );
}

function DesignSummary({ onClose }) {
  const s = useStudio();
  const values = s.mode === "wardrobe" ? s.wardrobe : s.kitchen;
  const text = `انتخاب من: ${s.mode === "wardrobe" ? "کمد دیواری" : "آشپزخانه"}\nسبک: ${byId(DOOR_STYLES, values.doorStyle).name}\nرنگ: ${byId(DOOR_COLORS, values.doorColor).name}\nدستگیره: ${byId(HANDLES, values.handle).name}\nصفحه: ${byId(COUNTERTOPS, s.kitchen.counter).name}`;
  const [copied, setCopied] = useState(false);
  const close = useRef();
  useEffect(() => {
    const previous = document.activeElement;
    useStudio.getState().setUI({ walkPaused: true, move: {} });
    close.current?.focus();
    const escape = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", escape);
    return () => {
      useStudio.getState().setUI({ walkPaused: false });
      window.removeEventListener("keydown", escape);
      previous?.focus?.();
    };
  }, []);
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-design.txt";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="summary-backdrop" onClick={onClose}>
      <section
        className="design-summary"
        role="dialog"
        aria-modal="true"
        aria-labelledby="summary-title"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            const items = [...e.currentTarget.querySelectorAll("button")];
            const first = items[0],
              last = items.at(-1);
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }}
      >
        <button
          ref={close}
          className="round-button"
          onClick={onClose}
          aria-label="بستن"
        >
          <IconX />
        </button>
        <small>YOUR DESIGN</small>
        <h2 id="summary-title">انتخاب شما، شروع یک گفتگو</h2>
        <pre>{text}</pre>
        <p>
          خلاصه انتخاب را ذخیره کنید و برای مشاور بفرستید. اطلاعات تماس مجموعه
          هنوز تنظیم نشده؛ این صفحه سفارشی ارسال نمی‌کند.
        </p>
        <button className="gold-button" onClick={download}>
          ذخیره انتخاب‌ها <IconArrowLeft />
        </button>
        <button
          className="text-button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? "کپی شد ✓" : "کپی انتخاب‌ها"}
        </button>
      </section>
    </div>
  );
}

export default function CustomerApp() {
  const [tour, setTour] = useState(false);
  const [panel, setPanel] = useState(false);
  const [summary, setSummary] = useState(false);
  const [notice, setNotice] = useState("");
  const [shot, setShot] = useState(null);
  const s = useStudio();
  useEffect(() => {
    // Fixed showroom, never a customer-entered room or editable layout.
    s.setRoom({ ...SHOWROOM_ROOM, floor: "stone" });
    s.setWardrobe({ width: 2.6, height: 2.45, depth: 0.62 });
    // A saved layout from the old editor must not overflow the showroom.
    const standard = useStudio.getInitialState().units;
    useStudio.setState({
      units: standard.map((u) => ({ ...u, open: false, parts: {} })),
    });
    s.setUI({
      showDims: false,
      planOpen: false,
      walkthrough: false,
      fixtureParts: {},
      move: {},
    });
  }, []);
  const enter = (mode = "kitchen", look) => {
    if (look)
      s.setKitchen({
        doorStyle: look.style,
        doorColor: look.color,
        counter: look.counter,
      });
    s.setMode(mode);
    s.setUI({
      ready: false,
      walkthrough: true,
      autoRotate: false,
      fixtureParts: {},
      move: {},
    });
    setTour(true);
    setPanel(false);
  };
  const leave = () => {
    s.setUI({ walkthrough: false, move: {} });
    setTour(false);
    setPanel(false);
  };
  return (
    <div className={`customer-site ${tour ? "in-tour" : ""}`}>
      <header className="customer-header">
        <button onClick={leave} aria-label="صفحه اصلی">
          <Brand />
        </button>
        <nav aria-label="منوی اصلی">
          <button className={!tour ? "active" : ""} onClick={leave}>
            صفحه اصلی
          </button>
          <a href="#collections" onClick={leave}>
            نمونه کارها
          </a>
          <a href="#services" onClick={leave}>
            خدمات ما
          </a>
          <a href="#about" onClick={leave}>
            درباره ما
          </a>
        </nav>
        <button
          className="gold-button header-cta"
          onClick={() => setSummary(true)}
        >
          مشاوره و سفارش <IconArrowLeft size={16} />
        </button>
      </header>
      {!tour ? (
        <>
          <section className="customer-hero" aria-label="معرفی طراحی کابینت">
            <img
              className="hero-image"
              src={hero}
              alt="آشپزخانه مدرن با جزیره سنگی، کابینت گریژ و نورپردازی گرم"
            />
            <div className="hero-shade" />
            <aside className="category-rail">
              <button className="active" onClick={() => enter()}>
                <IconDoor size={24} />
                کابینت
              </button>
              <button onClick={() => enter()}>
                <IconRoom size={24} />
                آشپزخانه
              </button>
              <button onClick={() => enter("wardrobe")}>
                <IconWardrobe size={24} />
                کمد دیواری
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("collections")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <IconLayers size={24} />
                دکوراسیون
              </button>
              <button className="rail-3d" onClick={() => enter()}>
                <span>3D</span>
                <small>۳۶۰°</small>
              </button>
            </aside>
            <motion.div
              className="hero-content"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="eyebrow">زیبایی در جزئیات زندگی است</span>
              <h1>
                طراحی و اجرای کابینت
                <br />
                با جدیدترین متریال و سبک‌ها
              </h1>
              <p>از ایده تا اجرا، همراه شما در طراحی فضای رویایی</p>
              <button className="gold-button hero-cta" onClick={() => enter()}>
                ورود به آشپزخانه <IconArrowLeft size={22} />
              </button>
              <span className="hero-caption">
                <IconEye size={17} /> حرکت در فضا · باز کردن درب و کشو · انتخاب
                متریال
              </span>
            </motion.div>
            <span className="hero-number" dir="ltr">
              01 <i /> THE KITCHEN COLLECTION
            </span>
          </section>
          <section className="customer-services" id="services">
            <div className="services-intro">
              <small>BEFORE YOU CHOOSE</small>
              <h2>
                طرح دلخواه خود را
                <br />
                به صورت سه‌بعدی ببینید
              </h2>
              <p>بدون وارد کردن ابعاد؛ قدم بزنید، لمس کنید، انتخاب کنید.</p>
            </div>
            <div className="service-item">
              <IconCheck size={30} />
              <h3>انتخاب با اطمینان</h3>
              <p>بررسی جزئیات قبل از اجرا</p>
            </div>
            <div className="service-item">
              <IconCube size={30} />
              <h3>تجربه‌ی سه‌بعدی</h3>
              <p>حرکت واقعی داخل فضای آماده</p>
            </div>
            <div className="service-item">
              <IconPalette size={30} />
              <h3>متریال به سلیقه شما</h3>
              <p>رنگ، صفحه و یراق‌آلات متنوع</p>
            </div>
            <div className="service-item">
              <IconDoor size={30} />
              <h3>جزئیات قابل لمس</h3>
              <p>باز و بسته کردن درب‌ها و کشوها</p>
            </div>
          </section>
          <section className="customer-collections" id="collections">
            <div className="collection-title">
              <div>
                <small>EXPLORE THE COLLECTION</small>
                <h2>کدام فضا، شبیه شماست؟</h2>
              </div>
              <p>یک سبک را انتخاب کنید و وارد فضای سه‌بعدی شوید.</p>
            </div>
            <div className="collection-grid">
              {STYLES.map((look, i) => (
                <button
                  className={`collection-card ${look.tone}`}
                  key={look.name}
                  onClick={() => enter("kitchen", look)}
                >
                  <img
                    src={hero}
                    alt="تصویر الهام‌بخش آشپزخانه"
                    loading="lazy"
                  />
                  <span className="collection-index">0{i + 1}</span>
                  <div>
                    <small>{look.desc}</small>
                    <h3>
                      {look.name} <IconArrowLeft />
                    </h3>
                  </div>
                </button>
              ))}
              <button
                className="collection-card wardrobe-card"
                onClick={() => enter("wardrobe")}
              >
                <IconWardrobe size={80} />
                <div>
                  <small>فضایی برای تمام جزئیات زندگی</small>
                  <h3>
                    کمد دیواری <IconArrowLeft />
                  </h3>
                </div>
              </button>
            </div>
            <p className="inspiration-note">
              تصاویر، الهام‌بخش طراحی‌اند؛ رنگ و سبک انتخابی در محیط سه‌بعدی
              اعمال می‌شود.
            </p>
          </section>
          <footer className="customer-footer" id="about">
            <Brand />
            <p>از انتخاب متریال تا لمس جزئیات؛ تجربه‌ی خانه، پیش از اجرا.</p>
            <button onClick={() => setSummary(true)}>
              شروع گفتگو <IconArrowLeft size={18} />
            </button>
          </footer>
        </>
      ) : (
        <main className="customer-tour">
          <Suspense
            fallback={
              <div className="tour-loading">
                در حال آماده‌سازی فضای سه‌بعدی…
              </div>
            }
          >
            <SceneView onShotReady={(fn) => setShot(() => fn)} onExit={leave} />
          </Suspense>
          <div className="tour-top">
            <div>
              <small>INTERACTIVE SHOWROOM</small>
              <h1>{s.mode === "wardrobe" ? "کمد دیواری" : "آشپزخانه‌ی شما"}</h1>
              <p>روی هر درب یا کشو کلیک کنید.</p>
            </div>
            <button className="tour-back" onClick={leave}>
              <IconX size={17} />
              خروج از فضا
            </button>
          </div>
          <div className="tour-tools">
            <button
              className={panel ? "selected" : ""}
              onClick={() => setPanel(!panel)}
            >
              <IconPalette />
              متریال و رنگ
            </button>
            <button
              onClick={() => {
                s.setUI({ walkthrough: !s.ui.walkthrough, move: {} });
                s.setView("eye");
              }}
            >
              <IconEye />
              {s.ui.walkthrough ? "نمای ۳۶۰ درجه" : "قدم زدن در فضا"}
            </button>
            <button
              onClick={() =>
                enter(s.mode === "kitchen" ? "wardrobe" : "kitchen")
              }
            >
              <IconWardrobe />
              {s.mode === "kitchen" ? "کمد دیواری" : "آشپزخانه"}
            </button>
            <button
              onClick={() => {
                s.openAll(false);
                s.setUI({ fixtureParts: {}, closeNonce: (s.ui.closeNonce || 0) + 1 });
              }}
            >
              <IconDoor />
              بستن درب‌ها
            </button>
            <button
              onClick={() => {
                if (shot) {
                  try {
                    shot();
                    setNotice("عکس ذخیره شد");
                  } catch {
                    setNotice("ذخیره عکس ممکن نشد");
                  }
                }
              }}
            >
              <IconCamera />
              عکس از فضا
            </button>
          </div>
          {panel && <CustomerPanel onClose={() => setPanel(false)} />}
          {s.ui.walkthrough && !summary && <MovementPad />}
          <div className="tour-help">
            {s.ui.walkthrough
              ? "W A S D یا کلیدهای جهت: حرکت · کشیدن تصویر: نگاه کردن"
              : "کشیدن تصویر: چرخش · اسکرول: نزدیک شدن"}
            <span>کلیک کوتاه روی درب یا کشو: باز / بسته</span>
          </div>
          {notice && (
            <button className="customer-notice" onClick={() => setNotice("")}>
              {notice} <IconX size={14} />
            </button>
          )}
        </main>
      )}
      {summary && <DesignSummary onClose={() => setSummary(false)} />}
    </div>
  );
}
