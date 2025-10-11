// htmlPdfGenerator.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";
import Handlebars from "handlebars";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ---------- Label maps ---------- */
const personalLabelMap = {
  name: "نام",
  family: "نام خانوادگی",
  birthDate: "تاریخ تولد",
  birthPlace: "محل تولد",
  residenceAddress: "آدرس محل سکونت",
  phoneHome: "تلفن منزل",
  mobile: "موبایل",
  email: "ایمیل",
  gender: "جنسیت",
  maritalStatus: "وضعیت تأهل",
  childrenCount: "تعداد فرزندان",
  religion: "مذهب",
  militaryStatus: "وضعیت سربازی",
};

const eduLabelMap = {
  institute: "مؤسسه/دانشگاه",
  startDate: "تاریخ شروع",
  endDate: "تاریخ پایان",
  major: "رشته",
  degree: "مدرک",
};

const langLabelMap = {
  name: "زبان",
  reading: "خواندن",
  writing: "نوشتن",
};

const workLabelMap = {
  period: "دوره/بازه زمانی",
  company: "شرکت",
  activityType: "نوع فعالیت",
  employeesCount: "تعداد کارکنان",
  manager: "مدیر مستقیم",
  position: "سمت",
  supervisedCount: "تعداد زیرمجموعه",
  salaryStart: "حقوق شروع",
  salaryEnd: "حقوق پایان",
  description: "توضیحات",
  reasonForLeaving: "دلیل ترک",
};

const refereeLabelMap = {
  name: "نام",
  workplace: "محل کار",
  position: "سمت",
  phone: "تلفن",
};

/* ---------- Safe JSON parse ---------- */
function safeParse(value) {
  try {
    if (typeof value === "string") return JSON.parse(value);
  } catch {}
  return value;
}

/* ---------- Professional HTML Template ---------- */
const htmlTemplate = `
<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>فرم رزومه حرفه‌ای</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap');
        
        * {
            font-family: 'Vazirmatn', sans-serif;
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            margin: 0;
            padding: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #2d3748;
            line-height: 1.6;
        }
        
        .resume-container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
            border-radius: 20px;
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: rgba(255,255,255,0.1);
            transform: rotate(45deg);
        }
        
        .title {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
            position: relative;
        }
        
        .subtitle {
            font-size: 18px;
            font-weight: 300;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px;
        }
        
        .section {
            margin-bottom: 40px;
            position: relative;
        }
        
        .section-title {
            font-size: 22px;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 25px;
            padding-bottom: 12px;
            border-bottom: 3px solid #3498db;
            position: relative;
        }
        
        .section-title::after {
            content: '';
            position: absolute;
            bottom: -3px;
            right: 0;
            width: 80px;
            height: 3px;
            background: #e74c3c;
        }
        
        .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .grid-3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .field-group {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 12px;
            border-right: 4px solid #3498db;
            transition: all 0.3s ease;
            margin-bottom: 12px;
        }
        
        .field-group:hover {
            background: #e3f2fd;
            transform: translateX(-5px);
        }
        
        .field-label {
            font-weight: 600;
            font-size: 13px;
            color: #2c3e50;
            margin-bottom: 6px;
            display: block;
        }
        
        .field-value {
            font-size: 14px;
            color: #4a5568;
            font-weight: 500;
        }
        
        .item-block {
            background: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 15px;
            border: 2px solid #e2e8f0;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
            position: relative;
        }
        
        .item-block:hover {
            border-color: #3498db;
            box-shadow: 0 8px 25px rgba(52, 152, 219, 0.15);
        }
        
        .item-block::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 5px;
            height: 100%;
            background: linear-gradient(to bottom, #3498db, #2c3e50);
            border-top-left-radius: 15px;
            border-bottom-left-radius: 15px;
        }
        
        .item-title {
            font-weight: 700;
            font-size: 16px;
            color: #2c3e50;
            margin-bottom: 15px;
            padding-right: 15px;
            position: relative;
        }
        
        .item-title::before {
            content: '📌';
            position: absolute;
            right: -25px;
            top: 0;
        }
        
        .badge {
            display: inline-block;
            background: #3498db;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 10px;
        }
        
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        
        .skill-item {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            text-align: center;
            font-weight: 600;
            font-size: 14px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .contact-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        
        .contact-item {
            display: flex;
            align-items: center;
            background: #f8f9fa;
            padding: 12px 15px;
            border-radius: 10px;
            border-right: 3px solid #e74c3c;
        }
        
        .contact-icon {
            margin-left: 10px;
            font-size: 18px;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        .footer {
            text-align: center;
            padding: 30px;
            background: #2c3e50;
            color: white;
            margin-top: 40px;
        }
        
        .footer-text {
            font-size: 14px;
            opacity: 0.8;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .grid-2, .grid-3 {
                grid-template-columns: 1fr;
            }
            
            .content {
                padding: 20px;
            }
            
            .header {
                padding: 30px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="resume-container">
        <!-- Header -->
        <div class="header">
            <div class="title">فرم رزومه حرفه‌ای</div>
            <div class="subtitle">{{personalInfo.0.value}} {{personalInfo.1.value}}</div>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- اطلاعات فردی -->
            <div class="section">
                <div class="section-title">
                    اطلاعات فردی
                    <span class="badge">مشخصات اصلی</span>
                </div>
                <div class="grid-3">
                    {{#each personalInfo}}
                    <div class="field-group">
                        <span class="field-label">{{this.label}}</span>
                        <div class="field-value">{{this.value}}</div>
                    </div>
                    {{/each}}
                </div>
            </div>

            <!-- تحصیلات -->
            {{#if educations.length}}
            <div class="section">
                <div class="section-title">
                    تحصیلات
                    <span class="badge">{{educations.length}} مورد</span>
                </div>
                {{#each educations}}
                <div class="item-block">
                    <div class="item-title">مورد تحصیلی {{inc @index}}</div>
                    <div class="grid-2">
                        {{#each this}}
                        <div class="field-group">
                            <span class="field-label">{{this.label}}</span>
                            <div class="field-value">{{this.value}}</div>
                        </div>
                        {{/each}}
                    </div>
                </div>
                {{/each}}
            </div>
            {{/if}}

            <!-- زبان‌ها -->
            {{#if languages.length}}
            <div class="section">
                <div class="section-title">
                    مهارت‌های زبانی
                    <span class="badge">{{languages.length}} زبان</span>
                </div>
                {{#each languages}}
                <div class="item-block">
                    <div class="item-title">زبان {{inc @index}}</div>
                    <div class="grid-3">
                        {{#each this}}
                        <div class="field-group">
                            <span class="field-label">{{this.label}}</span>
                            <div class="field-value">{{this.value}}</div>
                        </div>
                        {{/each}}
                    </div>
                </div>
                {{/each}}
            </div>
            {{/if}}

            <!-- سوابق کاری -->
            {{#if workHistories.length}}
            <div class="section">
                <div class="section-title">
                    سوابق کاری
                    <span class="badge">{{workHistories.length}} موقعیت</span>
                </div>
                {{#each workHistories}}
                <div class="item-block">
                    <div class="item-title">موقعیت شغلی {{inc @index}}</div>
                    <div class="grid-2">
                        {{#each this}}
                        <div class="field-group">
                            <span class="field-label">{{this.label}}</span>
                            <div class="field-value">{{this.value}}</div>
                        </div>
                        {{/each}}
                    </div>
                </div>
                {{/each}}
            </div>
            {{/if}}

            <!-- معرف‌ها -->
            {{#if referees.length}}
            <div class="section">
                <div class="section-title">
                    افراد معرف
                    <span class="badge">{{referees.length}} معرف</span>
                </div>
                {{#each referees}}
                <div class="item-block">
                    <div class="item-title">معرف {{inc @index}}</div>
                    <div class="grid-2">
                        {{#each this}}
                        <div class="field-group">
                            <span class="field-label">{{this.label}}</span>
                            <div class="field-value">{{this.value}}</div>
                        </div>
                        {{/each}}
                    </div>
                </div>
                {{/each}}
            </div>
            {{/if}}

            <!-- مهارت‌ها و اطلاعات تکمیلی -->
            {{#if additionalInfo.length}}
            <div class="section">
                <div class="section-title">
                    اطلاعات تکمیلی
                    <span class="badge">مهارت‌ها و توضیحات</span>
                </div>
                <div class="skills-grid">
                    {{#each additionalInfo}}
                    <div class="field-group">
                        <span class="field-label">{{this.label}}</span>
                        <div class="field-value">{{this.value}}</div>
                    </div>
                    {{/each}}
                </div>
            </div>
            {{/if}}

            <!-- اطلاعات تماس -->
            <div class="section">
                <div class="section-title">راه‌های ارتباطی</div>
                <div class="contact-info">
                    {{#each personalInfo}}
                    {{#if (contains this.label "تلفن")}}
                    <div class="contact-item">
                        <span class="contact-icon">📞</span>
                        <div>
                            <div class="field-label">{{this.label}}</div>
                            <div class="field-value">{{this.value}}</div>
                        </div>
                    </div>
                    {{/if}}
                    {{#if (contains this.label "موبایل")}}
                    <div class="contact-item">
                        <span class="contact-icon">📱</span>
                        <div>
                            <div class="field-label">{{this.label}}</div>
                            <div class="field-value">{{this.value}}</div>
                        </div>
                    </div>
                    {{/if}}
                    {{#if (contains this.label "ایمیل")}}
                    <div class="contact-item">
                        <span class="contact-icon">📧</span>
                        <div>
                            <div class="field-label">{{this.label}}</div>
                            <div class="field-value">{{this.value}}</div>
                        </div>
                    </div>
                    {{/if}}
                    {{/each}}
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-text">
                این رزومه به صورت حرفه‌ای توسط سیستم مدیریت رزومه بهمن تولید شده است
            </div>
        </div>
    </div>
</body>
</html>
`;

/* ---------- Helper functions ---------- */
Handlebars.registerHelper("inc", function (value) {
  return parseInt(value) + 1;
});

Handlebars.registerHelper("contains", function (str, search) {
  return String(str).includes(search);
});

function normalize(value) {
  if (value === undefined || value === null) return "";
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  )
    return String(value);
  if (Array.isArray(value)) return value.map((v) => normalize(v)).join("، ");
  if (typeof value === "object") {
    try {
      return Object.entries(value)
        .map(([k, v]) => `${k}: ${normalize(v)}`)
        .join(" | ");
    } catch {
      return JSON.stringify(value);
    }
  }
  return String(value);
}

/* ---------- Prepare data for template ---------- */
function prepareTemplateData(data) {
  // Personal info
  const personalInfo = Object.entries(personalLabelMap)
    .filter(([key]) => data[key] && data[key] !== "")
    .map(([key, label]) => ({
      label,
      value: normalize(data[key]),
    }));

  // Educations
  const educations = (data.educations || []).map((edu) =>
    Object.entries(eduLabelMap)
      .filter(([key]) => edu[key] && edu[key] !== "")
      .map(([key, label]) => ({
        label,
        value: normalize(edu[key]),
      })),
  );

  // Languages
  const languages = (data.languages || []).map((lang) =>
    Object.entries(langLabelMap)
      .filter(([key]) => lang[key] && lang[key] !== "")
      .map(([key, label]) => ({
        label,
        value: normalize(lang[key]),
      })),
  );

  // Work histories
  const workHistories = (data.workHistories || []).map((work) =>
    Object.entries(workLabelMap)
      .filter(([key]) => work[key] && work[key] !== "")
      .map(([key, label]) => ({
        label,
        value: normalize(work[key]),
      })),
  );

  // Referees
  const referees = (data.referees || []).map((ref) =>
    Object.entries(refereeLabelMap)
      .filter(([key]) => ref[key] && ref[key] !== "")
      .map(([key, label]) => ({
        label,
        value: normalize(ref[key]),
      })),
  );

  // Additional info
  const additionalFields = {
    skills: "مهارت‌ها",
    jobRequested: "شغل مورد درخواست",
    jobExperienceDuration: "مدت تجربه",
    willingToWorkIn: "مایل به کار در",
    monthsPerYearInOtherCity: "ماه‌های کار در شهرستان",
    otherInfo: "سایر توضیحات",
  };

  const additionalInfo = Object.entries(additionalFields)
    .filter(([key]) => data[key] && data[key] !== "")
    .map(([key, label]) => ({
      label,
      value: normalize(data[key]),
    }));

  return {
    personalInfo,
    educations,
    languages,
    workHistories,
    referees,
    additionalInfo,
  };
}

/* ---------- Main PDF Generation ---------- */
export async function generateFormPDF(data, pdfPath) {
  let browser = null;

  try {
    console.log(
      "📄 Starting Professional PDF generation for:",
      data.name,
      data.family,
    );

    // Parse arrays
    data.educations = safeParse(data.educations) || [];
    data.languages = safeParse(data.languages) || [];
    data.workHistories = safeParse(data.workHistories) || [];
    data.referees = safeParse(data.referees) || [];

    const dir = path.dirname(pdfPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Prepare template data
    const templateData = prepareTemplateData(data);

    // Compile and render template
    const template = Handlebars.compile(htmlTemplate);
    const htmlContent = template(templateData);

    // Launch Puppeteer with better configuration
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
      defaultViewport: {
        width: 1200,
        height: 1600,
      },
    });

    const page = await browser.newPage();

    // Set content and wait for fonts and styles to load
    await page.setContent(htmlContent, {
      waitUntil: ["networkidle0", "domcontentloaded"],
    });

    // Wait for fonts to load
    await page.evaluateHandle("document.fonts.ready");

    // Generate high-quality PDF
    await page.pdf({
      path: pdfPath,
      format: "A4",
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
    });

    console.log("✅ Professional PDF generated successfully:", pdfPath);
    return pdfPath;
  } catch (error) {
    console.error("❌ Error generating professional PDF:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
