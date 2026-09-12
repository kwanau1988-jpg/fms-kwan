"use client";

import { useState, useTransition, useRef } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  GraduationCap,
  Building2,
  AlertCircle,
  Search,
  Phone,
  Layers,
  MapPin,
  UserCheck,
  Sparkles,
  Award,
  FileText,
  Compass,
  Briefcase,
  Download,
  Upload,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { Button } from "@/components/ui/button";
import type { CurriculumDto, DepartmentDto } from "@/features/curriculum";
import {
  createCurriculumAction,
  updateCurriculumAction,
  deleteCurriculumAction,
  getCurriculaAction,
  createDepartmentAction,
  updateDepartmentAction,
  deleteDepartmentAction,
  getDepartmentsAction,
} from "@/features/curriculum/actions";

interface Props {
  initialItems: CurriculumDto[];
  initialDepartments: DepartmentDto[];
  canManage: boolean;
  canManageDepartments?: boolean;
  initialTab?: "curricula" | "departments";
}

export function CurriculumClient({
  initialItems,
  initialDepartments,
  canManage,
  canManageDepartments = true,
  initialTab = "curricula",
}: Props) {
  const t = useT();
  const locale = useLocale();
  const isTh = locale === "th";

  // Tab state
  const [activeTab, setActiveTab] = useState<"curricula" | "departments">(initialTab);
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);
  if (prevInitialTab !== initialTab) {
    setPrevInitialTab(initialTab);
    setActiveTab(initialTab);
  }
  const [items, setItems] = useState<CurriculumDto[]>(initialItems);
  const [departments, setDepartments] = useState<DepartmentDto[]>(initialDepartments);
  const [isPending, startTransition] = useTransition();

  // ----------------------------------------------------
  // Curriculum States
  // ----------------------------------------------------
  const [curriculumSearch, setCurriculumSearch] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("ALL");
  const [selectedLevelFilter, setSelectedLevelFilter] = useState("ALL");

  const [currModalOpen, setCurrModalOpen] = useState(false);
  const [editingCurr, setEditingCurr] = useState<CurriculumDto | null>(null);
  const [deleteConfirmCurr, setDeleteConfirmCurr] = useState<CurriculumDto | null>(null);

  // Curriculum Form
  const [currModalTab, setCurrModalTab] = useState<"general" | "outcomes" | "structure" | "docs">("general");
  const [currDeptId, setCurrDeptId] = useState<string>("");
  const [code, setCode] = useState("");
  const [nameTh, setNameTh] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [degreeTh, setDegreeTh] = useState("");
  const [degreeEn, setDegreeEn] = useState("");
  const [degreeLevel, setDegreeLevel] = useState<"BACHELOR" | "MASTER" | "DOCTORAL" | "SHORT_COURSE">("BACHELOR");
  const [totalCredits, setTotalCredits] = useState(132);
  const [tuitionFee, setTuitionFee] = useState<number | "">("");
  const [brochurePdfUrl, setBrochurePdfUrl] = useState("");
  const [status, setStatus] = useState<"OPEN" | "UPDATING" | "CLOSED">("OPEN");

  // MKO 2 Details Form State
  const [philosophy, setPhilosophy] = useState("");
  const [objectivesText, setObjectivesText] = useState("");
  const [plosText, setPlosText] = useState("");
  const [genEdCredits, setGenEdCredits] = useState(24);
  const [majorCredits, setMajorCredits] = useState(102);
  const [freeElectiveCredits, setFreeElectiveCredits] = useState(6);
  const [careerPathsText, setCareerPathsText] = useState("");
  const [qualifications, setQualifications] = useState("");

  // ----------------------------------------------------
  // Department States
  // ----------------------------------------------------
  const [deptSearch, setDeptSearch] = useState("");
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentDto | null>(null);
  const [deleteConfirmDept, setDeleteConfirmDept] = useState<DepartmentDto | null>(null);

  // Department Form
  const [deptCode, setDeptCode] = useState("");
  const [deptNameTh, setDeptNameTh] = useState("");
  const [deptNameEn, setDeptNameEn] = useState("");
  const [deptDescription, setDeptDescription] = useState("");
  const [deptHeadName, setDeptHeadName] = useState("");
  const [deptEmail, setDeptEmail] = useState("");
  const [deptPhone, setDeptPhone] = useState("");
  const [deptOfficeRoom, setDeptOfficeRoom] = useState("");
  const [deptDisplayOrder, setDeptDisplayOrder] = useState(0);
  const [deptIsActive, setDeptIsActive] = useState(true);

  // Refresh helpers
  const refreshCurricula = async () => {
    const res = await getCurriculaAction();
    if (res.ok) setItems(res.data);
  };

  const refreshDepartments = async () => {
    const res = await getDepartmentsAction(true);
    if (res.ok) setDepartments(res.data);
  };

  // ----------------------------------------------------
  // Curriculum Handlers
  // ----------------------------------------------------
  const openCreateCurrDialog = () => {
    setEditingCurr(null);
    setCurrDeptId("");
    setCode("");
    setNameTh("");
    setNameEn("");
    setDegreeTh("");
    setDegreeEn("");
    setDegreeLevel("BACHELOR");
    setTotalCredits(132);
    setTuitionFee("");
    setBrochurePdfUrl("");
    setStatus("OPEN");
    setCurrModalTab("general");
    setPhilosophy("");
    setObjectivesText("");
    setPlosText("");
    setGenEdCredits(24);
    setMajorCredits(102);
    setFreeElectiveCredits(6);
    setCareerPathsText("");
    setQualifications("");
    setCurrModalOpen(true);
  };

  const openEditCurrDialog = (item: CurriculumDto) => {
    setEditingCurr(item);
    setCurrDeptId(item.departmentId || "");
    setCode(item.code);
    setNameTh(item.nameTh);
    setNameEn(item.nameEn);
    setDegreeTh(item.degreeTh);
    setDegreeEn(item.degreeEn);
    setDegreeLevel(item.degreeLevel as "BACHELOR" | "MASTER" | "DOCTORAL" | "SHORT_COURSE");
    setTotalCredits(item.totalCredits);
    setTuitionFee(item.tuitionFee ?? "");
    setBrochurePdfUrl(item.brochurePdfUrl || "");
    setStatus(item.status as "OPEN" | "CLOSED" | "UPDATING");
    setCurrModalTab("general");
    setPhilosophy(item.philosophy || "");
    setObjectivesText((item.objectives || []).join("\n"));
    setPlosText(
      (item.plos || [])
        .map((p) => (p.descEn ? `${p.code}: ${p.descTh} | ${p.descEn}` : `${p.code}: ${p.descTh}`))
        .join("\n")
    );
    if (item.studyPlan && item.studyPlan.length >= 3) {
      setGenEdCredits(item.studyPlan[0].credits || 24);
      setMajorCredits(item.studyPlan[1].credits || 102);
      setFreeElectiveCredits(item.studyPlan[2].credits || 6);
    } else {
      setGenEdCredits(24);
      setMajorCredits(102);
      setFreeElectiveCredits(6);
    }
    setCareerPathsText((item.careerPaths || []).join("\n"));
    setQualifications(item.qualifications || "");
    setCurrModalOpen(true);
  };

  const loadMko2Template = () => {
    const buddhistDept = departments.find(
      (d) => d.code === "DEPT-BUDDHIST" || d.nameTh.includes("พระพุทธ")
    );
    if (buddhistDept) {
      setCurrDeptId(buddhistDept.id);
    }
    setCode("B.A.-BUDDHIST-70");
    setNameTh("หลักสูตรพุทธศาสตรบัณฑิต สาขาวิชาพระพุทธศาสนา (๔ ปี) (หลักสูตรปรับปรุง พ.ศ. ๒๕๗๐)");
    setNameEn("Bachelor of Arts Program in Buddhist Studies (Revised B.E. 2570)");
    setDegreeTh("พุทธศาสตรบัณฑิต (พระพุทธศาสนา) [พธ.บ.]");
    setDegreeEn("Bachelor of Arts (Buddhist Studies) [B.A.]");
    setDegreeLevel("BACHELOR");
    setTotalCredits(132);
    setTuitionFee(32000);
    setStatus("OPEN");
    setPhilosophy("จัดการศึกษาพระพุทธศาสนาบูรณาการกับศาสตร์สมัยใหม่ ผลิตบัณฑิตให้มีความรู้ดี มีศีลธรรม นำสังคมสู่สันติสุข");
    setObjectivesText([
      "เพื่อผลิตบัณฑิตมีความรอบรู้ในหลักพระพุทธศาสนาและศาสตร์ที่เกี่ยวข้องสามารถประยุกต์องค์ความรู้กับศาสตร์สมัยใหม่ได้อย่างเหมาะสม",
      "เพื่อผลิตบัณฑิตให้มีทักษะการถ่ายทอดหลักพุทธธรรมกับศาสตร์สมัยใหม่ เพื่อการเผยแผ่และการแก้ไขปัญหาสังคมในยุคปัจจุบันได้",
      "เพื่อผลิตบัณฑิตสามารถปฏิบัติตนตามหลักคุณธรรม จริยธรรม ยึดมั่นในหลักพระพุทธศาสนา มีความรับผิดชอบต่อสังคม และเป็นแบบอย่างที่ดีในการดำเนินชีวิต",
      "เพื่อผลิตบัณฑิตให้มีภาวะผู้นำ สามารถทำงานร่วมกับผู้อื่นและปฏิบัติงานเป็นทีมได้อย่างเหมาะสมพร้อมทั้งมีทักษะการเรียนรู้ตลอดชีวิตและสามารถปรับตัวต่อการเปลี่ยนแปลงของสังคมในศตวรรษที่ ๒๑",
      "เพื่อผลิตบัณฑิตสามารถใช้เทคโนโลยีดิจิทัล สารสนเทศ พุทธนวัตกรรม เพื่อการสื่อสารการเผยแผ่พระพุทธศาสนา การจัดการศึกษา และการบริหารองค์กรได้อย่างเหมาะสม",
    ].join("\n"));
    setPlosText([
      "PLO 1: มีความรอบรู้ในหลักพระพุทธศาสนาและศาสตร์ที่เกี่ยวข้อง สามารถประยุกต์องค์ความรู้กับศาสตร์สมัยใหม่ได้อย่างเหมาะสม | Demonstrate deep knowledge in Buddhist principles and related disciplines, integrating with modern sciences.",
      "PLO 2: มีทักษะการถ่ายทอดหลักพุทธธรรมกับศาสตร์สมัยใหม่ เพื่อการเผยแผ่และการแก้ไขปัญหาสังคมในยุคปัจจุบันได้ | Possess communication skills to convey Buddhist teachings with modern methods for propagation and societal problem-solving.",
      "PLO 3: สามารถปฏิบัติตนตามหลักคุณธรรม จริยธรรม ยึดมั่นในหลักพระพุทธศาสนา มีความรับผิดชอบต่อสังคม และเป็นแบบอย่างที่ดีในการดำเนินชีวิต | Adhere to moral and ethical principles rooted in Buddhism, uphold social responsibility, and serve as role models.",
      "PLO 4: มีภาวะผู้นำ สามารถทำงานร่วมกับผู้อื่นและปฏิบัติงานเป็นทีมได้อย่างเหมาะสม พร้อมทั้งมีทักษะการเรียนรู้ตลอดชีวิตและสามารถปรับตัวต่อการเปลี่ยนแปลงของสังคมในศตวรรษที่ ๒๑ | Exhibit leadership, teamwork, lifelong learning capabilities, and adaptability to 21st-century societal transformations.",
      "PLO 5: สามารถใช้เทคโนโลยีดิจิทัล สารสนเทศ พุทธนวัตกรรม เพื่อการสื่อสาร การเผยแผ่พระพุทธศาสนา การจัดการศึกษา และการบริหารองค์กรได้อย่างเหมาะสม | Utilize digital technologies, information systems, and Buddhist innovations for communication, education, and administration.",
    ].join("\n"));
    setGenEdCredits(24);
    setMajorCredits(102);
    setFreeElectiveCredits(6);
    setCareerPathsText([
      "นักวิชาการศาสนา / เจ้าหน้าที่ศาสนพิธี (สำนักงานพระพุทธศาสนาแห่งชาติ และกระทรวงวัฒนธรรม)",
      "อนุศาสนาจารย์ (กองทัพบก กองทัพเรือ กองทัพอากาศ และสำนักงานตำรวจแห่งชาติ)",
      "นักจัดกระบวนการเรียนรู้และสมาธิบำบัด (Mindfulness & Meditation Facilitator)",
      "นักเยียวยาจิตใจและผู้ดูแลสุขภาวะทางจิตวิญญาณ (Spiritual Caregiver ในโรงพยาบาลและ Palliative Care)",
      "นักสร้างสรรค์เนื้อหาทางศาสนา ศิลปวัฒนธรรม (Religious & Cultural Content Creator)",
      "ผู้นำเที่ยวและผู้จัดการการท่องเที่ยวเชิงจิตวิญญาณและพุทธศิลป์ (Spiritual & Cultural Tourism Specialist)",
      "นักวิชาการพัฒนาสังคม / นักสังคมสงเคราะห์ในหน่วยงานรัฐและองค์กรพัฒนาเอกชน (NGOs)",
      "เจ้าหน้าที่ฝ่ายพัฒนาทรัพยากรมนุษย์ (HRD) และส่งเสริมจริยธรรมองค์กร (CSR)",
      "พระธรรมทูต (ทั้งในและต่างประเทศ) / พระวิปัสสนาจารย์ / นักวิจัยด้านพุทธศาสน์ศึกษา",
    ].join("\n"));
    setQualifications(
      "๑. พระภิกษุ/สามเณร และคฤหัสถ์ สำเร็จการศึกษาระดับมัธยมศึกษาตอนปลาย (ม.๖) หรือเทียบเท่า ๒. เป็นไปตามข้อบังคับมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ว่าด้วยการศึกษาระดับปริญญาตรี พ.ศ. ๒๕๖๖ ๓. หรือผ่านการคัดเลือกตามเกณฑ์ของสำนักงานปลัดกระทรวงการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม (อว.)"
    );
    setBrochurePdfUrl("/documents/mko2-buddhist-studies-2570.pdf");
    toast.success(
      isTh
        ? "นำเข้าข้อมูลมาตรฐาน มคอ. 2 (พุทธศาสตรบัณฑิต ๒๕๗๐) เรียบร้อยแล้ว"
        : "Loaded TQF 2 Buddhist Studies template successfully"
    );
  };

  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJson = () => {
    const selectedDept = departments.find((d) => d.id === currDeptId);
    const studyPlan = [
      {
        categoryTh: "หมวดวิชาศึกษาทั่วไป",
        categoryEn: "General Education Courses",
        credits: Number(genEdCredits) || 0,
        description: "",
      },
      {
        categoryTh: "หมวดวิชาเฉพาะ",
        categoryEn: "Major Requirements",
        credits: Number(majorCredits) || 0,
        description: "",
      },
      {
        categoryTh: "หมวดวิชาเลือกเสรี",
        categoryEn: "Free Elective Courses",
        credits: Number(freeElectiveCredits) || 0,
        description: "",
      },
    ];

    const objectives = objectivesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const plos = plosText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, idx) => {
        const colonIdx = line.indexOf(":");
        if (colonIdx > 0) {
          const codePart = line.slice(0, colonIdx).trim();
          const rest = line.slice(colonIdx + 1).trim();
          const pipeParts = rest.split("|").map((p) => p.trim());
          return {
            code: codePart,
            descTh: pipeParts[0] || rest,
            descEn: pipeParts[1] || "",
          };
        }
        return {
          code: `PLO ${idx + 1}`,
          descTh: line,
          descEn: "",
        };
      });

    const careerPaths = careerPathsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const exportData = {
      $schema: "https://fms.ac.th/schemas/curriculum-mko2.json",
      version: "1.0",
      exportedAt: new Date().toISOString(),
      code: code || "CURR-UNNAMED",
      nameTh,
      nameEn,
      degreeTh,
      degreeEn,
      degreeLevel,
      totalCredits: Number(totalCredits) || 0,
      tuitionFee: tuitionFee === "" ? null : Number(tuitionFee),
      status,
      brochurePdfUrl: brochurePdfUrl || "",
      departmentId: currDeptId || null,
      departmentCode: selectedDept?.code || "",
      departmentNameTh: selectedDept?.nameTh || "",
      departmentNameEn: selectedDept?.nameEn || "",
      philosophy,
      objectives,
      plos,
      studyPlan,
      careerPaths,
      qualifications,
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeCode = (code || "curriculum").replace(/[^a-zA-Z0-9_\-\.]/g, "_");
    link.download = `${safeCode}_mko2.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(t("curriculum.exportJsonSuccess"));
  };

  const applyImportedJsonData = (data: Record<string, unknown>) => {
    if (!data || typeof data !== "object") {
      toast.error(t("curriculum.importJsonError"));
      return;
    }

    if (data.code) setCode(String(data.code));
    if (data.nameTh || data.name) setNameTh(String(data.nameTh || data.name));
    if (data.nameEn) setNameEn(String(data.nameEn));
    if (data.degreeTh || data.degree) setDegreeTh(String(data.degreeTh || data.degree));
    if (data.degreeEn) setDegreeEn(String(data.degreeEn));

    if (data.degreeLevel && ["BACHELOR", "MASTER", "DOCTORAL", "SHORT_COURSE"].includes(data.degreeLevel as string)) {
      setDegreeLevel(data.degreeLevel as "BACHELOR" | "MASTER" | "DOCTORAL" | "SHORT_COURSE");
    }

    if (data.totalCredits !== undefined) setTotalCredits(Number(data.totalCredits) || 0);
    if (data.tuitionFee !== undefined && data.tuitionFee !== null) {
      setTuitionFee(Number(data.tuitionFee) || "");
    }
    if (data.status && ["OPEN", "UPDATING", "CLOSED"].includes(data.status as string)) {
      setStatus(data.status as "OPEN" | "UPDATING" | "CLOSED");
    }
    if (data.brochurePdfUrl !== undefined) {
      setBrochurePdfUrl(String(data.brochurePdfUrl || ""));
    }

    if (data.philosophy !== undefined) {
      setPhilosophy(String(data.philosophy || ""));
    }

    if (Array.isArray(data.objectives)) {
      setObjectivesText(data.objectives.map((o: unknown) => String(o)).join("\n"));
    } else if (typeof data.objectives === "string") {
      setObjectivesText(data.objectives);
    }

    if (Array.isArray(data.plos)) {
      setPlosText(
        data.plos
          .map((p: unknown) => {
            if (typeof p === "string") return p;
            if (p && typeof p === "object") {
              const obj = p as Record<string, unknown>;
              const code = String(obj.code || "");
              const descTh = String(obj.descTh || "");
              const descEn = String(obj.descEn || "");
              if (descEn) return `${code}: ${descTh} | ${descEn}`;
              return `${code}: ${descTh}`;
            }
            return "";
          })
          .filter(Boolean)
          .join("\n"),
      );
    } else if (typeof data.plos === "string") {
      setPlosText(data.plos);
    }

    if (Array.isArray(data.studyPlan)) {
      const plan = data.studyPlan as Record<string, unknown>[];
      if (plan.length >= 1 && plan[0].credits !== undefined) {
        setGenEdCredits(Number(plan[0].credits) || 0);
      }
      if (plan.length >= 2 && plan[1].credits !== undefined) {
        setMajorCredits(Number(plan[1].credits) || 0);
      }
      if (plan.length >= 3 && plan[2].credits !== undefined) {
        setFreeElectiveCredits(Number(plan[2].credits) || 0);
      }
    } else {
      if (data.genEdCredits !== undefined) setGenEdCredits(Number(data.genEdCredits) || 0);
      if (data.majorCredits !== undefined) setMajorCredits(Number(data.majorCredits) || 0);
      if (data.freeElectiveCredits !== undefined) setFreeElectiveCredits(Number(data.freeElectiveCredits) || 0);
    }

    if (Array.isArray(data.careerPaths)) {
      setCareerPathsText(data.careerPaths.map((c: unknown) => String(c)).join("\n"));
    } else if (typeof data.careerPaths === "string") {
      setCareerPathsText(data.careerPaths);
    }

    if (data.qualifications !== undefined) {
      setQualifications(String(data.qualifications || ""));
    }

    if (data.departmentId && departments.some((d) => d.id === data.departmentId)) {
      setCurrDeptId(String(data.departmentId));
    } else if (data.departmentCode) {
      const match = departments.find((d) => d.code.toUpperCase() === String(data.departmentCode).toUpperCase());
      if (match) setCurrDeptId(match.id);
    } else if (data.departmentNameTh || data.departmentName) {
      const targetName = String(data.departmentNameTh || data.departmentName).toLowerCase();
      const match = departments.find((d) => d.nameTh.toLowerCase().includes(targetName) || d.nameEn.toLowerCase().includes(targetName));
      if (match) setCurrDeptId(match.id);
    }

    toast.success(t("curriculum.importJsonSuccess"));
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as Record<string, unknown>;
        applyImportedJsonData(parsed);
      } catch (err) {
        console.error("Failed to parse JSON file", err);
        toast.error(t("curriculum.importJsonError"));
      } finally {
        if (jsonFileInputRef.current) {
          jsonFileInputRef.current.value = "";
        }
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleSaveCurriculum = () => {
    if (!code.trim() || !nameTh.trim() || !degreeTh.trim()) {
      toast.error(isTh ? "กรุณากรอกรหัสและชื่อหลักสูตร" : "Please fill in Program Code and Title");
      return;
    }

    const parsedObjectives = objectivesText
      .split("\n")
      .map((s) => s.trim().replace(/^\d+[\.\)]\s*/, ""))
      .filter(Boolean);

    const parsedPlos = plosText
      .split("\n")
      .map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        let codeStr = `PLO ${idx + 1}`;
        let descTh = trimmed;
        let descEn = "";

        if (trimmed.includes("|")) {
          const parts = trimmed.split("|");
          descTh = parts[0].trim();
          descEn = parts.slice(1).join("|").trim();
        }

        const match = descTh.match(/^(PLO\s*\d+)\s*[:：\-]\s*(.*)$/i);
        if (match) {
          codeStr = match[1].toUpperCase().replace(/\s+/, " ");
          descTh = match[2].trim();
        }

        return { code: codeStr, descTh, descEn };
      })
      .filter((p): p is { code: string; descTh: string; descEn: string } => p !== null);

    const parsedCareerPaths = careerPathsText
      .split("\n")
      .map((s) => s.trim().replace(/^[-•*]\s*/, "").replace(/^\d+[\.\)]\s*/, ""))
      .filter(Boolean);

    const studyPlan = [
      {
        categoryTh: "๑) หมวดวิชาศึกษาทั่วไป (ไม่น้อยกว่า ๒๔ หน่วยกิต)",
        categoryEn: "General Education Courses (Min. 24 Credits)",
        credits: Number(genEdCredits) || 0,
        description: "กลุ่มวิชาภาษา มนุษยศาสตร์ สังคมศาสตร์ วิทยาศาสตร์และคณิตศาสตร์",
      },
      {
        categoryTh: "๒) หมวดวิชาเฉพาะ (ไม่น้อยกว่า ๑๐๒ หน่วยกิต)",
        categoryEn: "Major Courses (Min. 102 Credits)",
        credits: Number(majorCredits) || 0,
        description: "วิชาแกนพระพุทธศาสนา วิชาเฉพาะด้าน และวิชาเลือกเฉพาะสาขา",
      },
      {
        categoryTh: "๓) หมวดวิชาเลือกเสรี (ไม่น้อยกว่า ๖ หน่วยกิต)",
        categoryEn: "Free Elective Courses (Min. 6 Credits)",
        credits: Number(freeElectiveCredits) || 0,
        description: "เลือกศึกษาในรายวิชาที่เปิดสอนระดับปริญญาตรีของมหาวิทยาลัยตามความสนใจ",
      },
    ];

    startTransition(async () => {
      if (editingCurr) {
        const res = await updateCurriculumAction({
          id: editingCurr.id,
          departmentId: currDeptId ? currDeptId : null,
          code: code.trim(),
          nameTh: nameTh.trim(),
          nameEn: nameEn.trim() || nameTh.trim(),
          degreeTh: degreeTh.trim(),
          degreeEn: degreeEn.trim() || degreeTh.trim(),
          degreeLevel,
          philosophy: philosophy.trim() || null,
          objectives: parsedObjectives,
          plos: parsedPlos,
          studyPlan,
          totalCredits: Number(totalCredits) || 120,
          tuitionFee: tuitionFee === "" ? undefined : Number(tuitionFee),
          careerPaths: parsedCareerPaths,
          qualifications: qualifications.trim() || null,
          brochurePdfUrl: brochurePdfUrl.trim() || undefined,
          status,
        });
        if (res.ok) {
          toast.success(t("curriculum.updateSuccess"));
          setCurrModalOpen(false);
          await refreshCurricula();
          await refreshDepartments();
        } else {
          toast.error(t("common.error"));
        }
      } else {
        const res = await createCurriculumAction({
          departmentId: currDeptId ? currDeptId : null,
          code: code.trim(),
          nameTh: nameTh.trim(),
          nameEn: nameEn.trim() || nameTh.trim(),
          degreeTh: degreeTh.trim(),
          degreeEn: degreeEn.trim() || degreeTh.trim(),
          degreeLevel,
          philosophy: philosophy.trim() || null,
          objectives: parsedObjectives,
          plos: parsedPlos,
          studyPlan,
          totalCredits: Number(totalCredits) || 120,
          tuitionFee: tuitionFee === "" ? undefined : Number(tuitionFee),
          careerPaths: parsedCareerPaths,
          qualifications: qualifications.trim() || null,
          brochurePdfUrl: brochurePdfUrl.trim() || undefined,
          status,
        });
        if (res.ok) {
          toast.success(t("curriculum.createSuccess"));
          setCurrModalOpen(false);
          await refreshCurricula();
          await refreshDepartments();
        } else {
          toast.error(t("common.error"));
        }
      }
    });
  };

  const handleDeleteCurriculum = (item: CurriculumDto) => {
    startTransition(async () => {
      const res = await deleteCurriculumAction(item.id);
      if (res.ok) {
        toast.success(t("curriculum.deleteSuccess"));
        setDeleteConfirmCurr(null);
        await refreshCurricula();
        await refreshDepartments();
      } else {
        toast.error(t("common.error"));
      }
    });
  };

  // ----------------------------------------------------
  // Department Handlers
  // ----------------------------------------------------
  const openCreateDeptDialog = () => {
    setEditingDept(null);
    setDeptCode("");
    setDeptNameTh("");
    setDeptNameEn("");
    setDeptDescription("");
    setDeptHeadName("");
    setDeptEmail("");
    setDeptPhone("");
    setDeptOfficeRoom("");
    setDeptDisplayOrder(departments.length + 1);
    setDeptIsActive(true);
    setDeptModalOpen(true);
  };

  const openEditDeptDialog = (dept: DepartmentDto) => {
    setEditingDept(dept);
    setDeptCode(dept.code);
    setDeptNameTh(dept.nameTh);
    setDeptNameEn(dept.nameEn);
    setDeptDescription(dept.description || "");
    setDeptHeadName(dept.headName || "");
    setDeptEmail(dept.email || "");
    setDeptPhone(dept.phone || "");
    setDeptOfficeRoom(dept.officeRoom || "");
    setDeptDisplayOrder(dept.displayOrder);
    setDeptIsActive(dept.isActive);
    setDeptModalOpen(true);
  };

  const handleSaveDepartment = () => {
    if (!deptCode.trim() || !deptNameTh.trim()) {
      toast.error(isTh ? "กรุณากรอกรหัสและชื่อภาควิชา (ไทย)" : "Please fill in Department Code and Thai Name");
      return;
    }

    startTransition(async () => {
      if (editingDept) {
        const res = await updateDepartmentAction({
          id: editingDept.id,
          code: deptCode.trim(),
          nameTh: deptNameTh.trim(),
          nameEn: deptNameEn.trim() || deptNameTh.trim(),
          description: deptDescription.trim() || undefined,
          headName: deptHeadName.trim() || undefined,
          email: deptEmail.trim() || undefined,
          phone: deptPhone.trim() || undefined,
          officeRoom: deptOfficeRoom.trim() || undefined,
          displayOrder: deptDisplayOrder,
          isActive: deptIsActive,
        });
        if (res.ok) {
          toast.success(t("department.updateSuccess"));
          setDeptModalOpen(false);
          await refreshDepartments();
          await refreshCurricula();
        } else {
          toast.error(t("common.error"));
        }
      } else {
        const res = await createDepartmentAction({
          code: deptCode.trim(),
          nameTh: deptNameTh.trim(),
          nameEn: deptNameEn.trim() || deptNameTh.trim(),
          description: deptDescription.trim() || undefined,
          headName: deptHeadName.trim() || undefined,
          email: deptEmail.trim() || undefined,
          phone: deptPhone.trim() || undefined,
          officeRoom: deptOfficeRoom.trim() || undefined,
          displayOrder: deptDisplayOrder,
          isActive: deptIsActive,
        });
        if (res.ok) {
          toast.success(t("department.createSuccess"));
          setDeptModalOpen(false);
          await refreshDepartments();
        } else {
          toast.error(t("common.error"));
        }
      }
    });
  };

  const handleDeleteDepartment = (dept: DepartmentDto) => {
    if (dept.curriculaCount > 0) {
      toast.error(t("department.deleteHasCurriculaError"));
      return;
    }

    startTransition(async () => {
      const res = await deleteDepartmentAction(dept.id);
      if (res.ok) {
        toast.success(t("department.deleteSuccess"));
        setDeleteConfirmDept(null);
        await refreshDepartments();
      } else {
        toast.error(t("common.error"));
      }
    });
  };

  // ----------------------------------------------------
  // Filtered Lists
  // ----------------------------------------------------
  const filteredCurricula = items.filter((item) => {
    const matchesSearch =
      item.code.toLowerCase().includes(curriculumSearch.toLowerCase()) ||
      item.nameTh.toLowerCase().includes(curriculumSearch.toLowerCase()) ||
      item.nameEn.toLowerCase().includes(curriculumSearch.toLowerCase()) ||
      (item.departmentNameTh && item.departmentNameTh.toLowerCase().includes(curriculumSearch.toLowerCase()));

    const matchesDept =
      selectedDeptFilter === "ALL"
        ? true
        : selectedDeptFilter === "UNASSIGNED"
        ? !item.departmentId
        : item.departmentId === selectedDeptFilter;

    const matchesLevel =
      selectedLevelFilter === "ALL" ? true : item.degreeLevel === selectedLevelFilter;

    return matchesSearch && matchesDept && matchesLevel;
  });

  const filteredDepartments = departments.filter((d) => {
    return (
      d.code.toLowerCase().includes(deptSearch.toLowerCase()) ||
      d.nameTh.toLowerCase().includes(deptSearch.toLowerCase()) ||
      d.nameEn.toLowerCase().includes(deptSearch.toLowerCase()) ||
      (d.headName && d.headName.toLowerCase().includes(deptSearch.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("curriculum.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("curriculum.subtitle")}</p>
        </div>

        {/* Tab Actions */}
        {activeTab === "curricula" && canManage && (
          <Button onClick={openCreateCurrDialog} className="gap-2 bg-brand text-on-brand hover:bg-brand/90">
            <Plus className="h-4 w-4" />
            <span>{t("curriculum.create")}</span>
          </Button>
        )}
        {activeTab === "departments" && canManageDepartments && (
          <Button onClick={openCreateDeptDialog} className="gap-2 bg-brand text-on-brand hover:bg-brand/90">
            <Plus className="h-4 w-4" />
            <span>{t("department.create")}</span>
          </Button>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("curricula")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "curricula"
              ? "bg-brand text-on-brand shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>{t("curriculum.tab.curricula")}</span>
          <span
            className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === "curricula"
                ? "bg-white/20 text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {items.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("departments")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "departments"
              ? "bg-brand text-on-brand shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{t("curriculum.tab.departments")}</span>
          <span
            className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === "departments"
                ? "bg-white/20 text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {departments.length}
          </span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: CURRICULA LIST */}
      {/* ---------------------------------------------------- */}
      {activeTab === "curricula" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={curriculumSearch}
                onChange={(e) => setCurriculumSearch(e.target.value)}
                placeholder={t("curriculum.searchPlaceholder")}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-hidden focus:ring-2 focus:ring-brand/30"
              />
            </div>

            {/* Department Filter */}
            <div className="w-full sm:w-60">
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-hidden focus:ring-2 focus:ring-brand/30"
              >
                <option value="ALL">{t("curriculum.allDepartments")}</option>
                <option value="UNASSIGNED">{t("curriculum.noDepartment")}</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {isTh ? d.nameTh : d.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div className="w-full sm:w-44">
              <select
                value={selectedLevelFilter}
                onChange={(e) => setSelectedLevelFilter(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-hidden focus:ring-2 focus:ring-brand/30"
              >
                <option value="ALL">{isTh ? "ทุกระดับการศึกษา" : "All Levels"}</option>
                <option value="BACHELOR">{t("curriculum.level.BACHELOR")}</option>
                <option value="MASTER">{t("curriculum.level.MASTER")}</option>
                <option value="DOCTORAL">{t("curriculum.level.DOCTORAL")}</option>
                <option value="SHORT_COURSE">{t("curriculum.level.SHORT_COURSE")}</option>
              </select>
            </div>
          </div>

          {/* Curricula Table */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            {filteredCurricula.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground space-y-2">
                <GraduationCap className="w-8 h-8 mx-auto opacity-50" />
                <p className="text-sm">{t("curriculum.empty")}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3.5">{t("curriculum.code")}</th>
                      <th className="px-6 py-3.5">{t("curriculum.nameTh")}</th>
                      <th className="px-6 py-3.5">{t("curriculum.department")}</th>
                      <th className="px-6 py-3.5">{t("curriculum.degreeLevel")}</th>
                      <th className="px-6 py-3.5">{t("curriculum.totalCredits")}</th>
                      <th className="px-6 py-3.5">{t("curriculum.status")}</th>
                      {canManage && <th className="px-6 py-3.5 text-right">{t("common.actions")}</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredCurricula.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-mono font-semibold text-xs text-brand">{item.code}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{item.nameTh}</span>
                            {item.philosophy && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                มคอ. 2
                              </span>
                            )}
                            {item.brochurePdfUrl && (
                              <a
                                href={item.brochurePdfUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 rounded text-muted-foreground hover:text-brand transition-colors"
                                title={isTh ? "เปิดดูไฟล์ มคอ. 2 (PDF)" : "View TQF 2 PDF"}
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground font-light">{item.degreeTh}</div>
                        </td>
                        <td className="px-6 py-4">
                          {item.departmentNameTh ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-muted text-foreground border border-border/50">
                              <Building2 className="w-3.5 h-3.5 text-brand" />
                              <span>{isTh ? item.departmentNameTh : item.departmentNameEn}</span>
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              {t("curriculum.noDepartment")}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-brand/10 text-brand">
                            {item.degreeLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-foreground/90 font-medium">
                          {item.totalCredits} {locale === "th" ? "หน่วยกิต" : "Credits"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              item.status === "OPEN"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : item.status === "UPDATING"
                                ? "bg-amber-500/10 text-amber-600"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        {canManage && (
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditCurrDialog(item)}
                                title={t("curriculum.edit")}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteConfirmCurr(item)}
                                title={t("curriculum.delete")}
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: DEPARTMENTS LIST */}
      {/* ---------------------------------------------------- */}
      {activeTab === "departments" && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={deptSearch}
              onChange={(e) => setDeptSearch(e.target.value)}
              placeholder={t("department.searchPlaceholder")}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-hidden focus:ring-2 focus:ring-brand/30"
            />
          </div>

          {/* Departments Table */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            {filteredDepartments.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground space-y-2">
                <Building2 className="w-8 h-8 mx-auto opacity-50" />
                <p className="text-sm">{t("department.empty")}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3.5">{t("department.code")}</th>
                      <th className="px-6 py-3.5">{t("department.nameTh")}</th>
                      <th className="px-6 py-3.5">{t("department.headName")}</th>
                      <th className="px-6 py-3.5">{t("department.officeRoom")}</th>
                      <th className="px-6 py-3.5">{t("department.curriculaCount")}</th>
                      <th className="px-6 py-3.5">{t("department.status")}</th>
                      {canManageDepartments && <th className="px-6 py-3.5 text-right">{t("common.actions")}</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredDepartments.map((dept) => (
                      <tr key={dept.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-mono font-semibold text-xs text-brand">
                          {dept.code}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-foreground">{dept.nameTh}</div>
                          <div className="text-xs text-muted-foreground">{dept.nameEn}</div>
                        </td>
                        <td className="px-6 py-4">
                          {dept.headName ? (
                            <div className="flex items-center gap-1.5 text-xs text-foreground">
                              <UserCheck className="w-3.5 h-3.5 text-brand" />
                              <span>{dept.headName}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground">
                          {dept.officeRoom ? (
                            <div className="flex items-center gap-1.5 text-foreground">
                              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                              <span>{dept.officeRoom}</span>
                            </div>
                          ) : null}
                          {dept.phone && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Phone className="w-3 h-3 text-muted-foreground" />
                              <span>{dept.phone}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand/10 text-brand">
                            <Layers className="w-3 h-3" />
                            <span>{dept.curriculaCount} {isTh ? "หลักสูตร" : "programs"}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              dept.isActive
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {dept.isActive ? t("department.status.active") : t("department.status.inactive")}
                          </span>
                        </td>
                        {canManageDepartments && (
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDeptDialog(dept)}
                                title={t("department.edit")}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteConfirmDept(dept)}
                                title={t("department.delete")}
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: CREATE / EDIT CURRICULUM (WITH TQF 2 SUPPORT) */}
      {/* ---------------------------------------------------- */}
      {currModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="space-y-0.5">
                <h2 className="text-xl font-bold text-foreground">
                  {editingCurr ? t("curriculum.edit") : t("curriculum.create")}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isTh
                    ? "กำหนดรายละเอียดหลักสูตร โครงสร้างหน่วยกิต และผลลัพธ์การเรียนรู้ (มคอ. 2)"
                    : "Configure curriculum specs, credit structure, and TQF 2 outcomes"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-500/30 transition-colors cursor-pointer"
                  title={isTh ? "ส่งออกข้อมูลหลักสูตรเป็นไฟล์ JSON" : "Export curriculum as JSON"}
                >
                  <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{t("curriculum.exportJson")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => jsonFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors cursor-pointer"
                  title={isTh ? "นำเข้าข้อมูลหลักสูตรจากไฟล์ JSON" : "Import curriculum from JSON"}
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("curriculum.importJson")}</span>
                </button>
                <input
                  ref={jsonFileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleImportJsonFile}
                />

                <button
                  type="button"
                  onClick={loadMko2Template}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors cursor-pointer"
                  title={isTh ? "ดึงข้อมูลตัวอย่าง มคอ. 2 พระพุทธศาสนา 2570 เข้าแบบฟอร์มทันที" : "Populate with TQF 2 template"}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isTh ? "เติมข้อมูลตัวอย่าง มคอ. 2" : "Load TQF 2 Template"}</span>
                </button>
              </div>
            </div>

            {/* Modal Sub-Tabs */}
            <div className="flex border-b border-border/60 gap-1 overflow-x-auto">
              <button
                type="button"
                onClick={() => setCurrModalTab("general")}
                className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  currModalTab === "general"
                    ? "border-brand text-brand"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {isTh ? "๑. ข้อมูลทั่วไป" : "1. General Info"}
              </button>
              <button
                type="button"
                onClick={() => setCurrModalTab("outcomes")}
                className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  currModalTab === "outcomes"
                    ? "border-brand text-brand"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {isTh ? "๒. ปรัชญาและ PLOs" : "2. Philosophy & PLOs"}
              </button>
              <button
                type="button"
                onClick={() => setCurrModalTab("structure")}
                className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  currModalTab === "structure"
                    ? "border-brand text-brand"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {isTh ? "๓. โครงสร้างและอาชีพ" : "3. Structure & Careers"}
              </button>
              <button
                type="button"
                onClick={() => setCurrModalTab("docs")}
                className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  currModalTab === "docs"
                    ? "border-brand text-brand"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {isTh ? "๔. เอกสาร มคอ. 2 (PDF)" : "4. TQF 2 Document"}
              </button>
            </div>

            {/* Modal Tab Content */}
            <div className="space-y-4">
              {/* TAB 1: GENERAL */}
              {currModalTab === "general" && (
                <div className="space-y-4">
                  {/* Department selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-brand" />
                      <span>{t("curriculum.department")}</span>
                    </label>
                    <select
                      value={currDeptId}
                      onChange={(e) => setCurrDeptId(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background text-foreground"
                    >
                      <option value="">{t("curriculum.departmentPlaceholder")}</option>
                      {departments
                        .filter((d) => d.isActive || d.id === currDeptId)
                        .map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.code} - {isTh ? d.nameTh : d.nameEn}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">{t("curriculum.code")} *</label>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="เช่น B.A.-BUDDHIST-70"
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">{t("curriculum.degreeLevel")}</label>
                      <select
                        value={degreeLevel}
                        onChange={(e) =>
                          setDegreeLevel(e.target.value as "BACHELOR" | "MASTER" | "DOCTORAL" | "SHORT_COURSE")
                        }
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                      >
                        <option value="BACHELOR">{t("curriculum.level.BACHELOR")}</option>
                        <option value="MASTER">{t("curriculum.level.MASTER")}</option>
                        <option value="DOCTORAL">{t("curriculum.level.DOCTORAL")}</option>
                        <option value="SHORT_COURSE">{t("curriculum.level.SHORT_COURSE")}</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">{t("curriculum.nameTh")} *</label>
                    <input
                      type="text"
                      value={nameTh}
                      onChange={(e) => setNameTh(e.target.value)}
                      placeholder="เช่น หลักสูตรพุทธศาสตรบัณฑิต สาขาวิชาพระพุทธศาสนา (๔ ปี) (หลักสูตรปรับปรุง พ.ศ. ๒๕๗๐)"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">{t("curriculum.nameEn")}</label>
                    <input
                      type="text"
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      placeholder="e.g. Bachelor of Arts Program in Buddhist Studies (Revised B.E. 2570)"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">{t("curriculum.degreeTh")} *</label>
                      <input
                        type="text"
                        value={degreeTh}
                        onChange={(e) => setDegreeTh(e.target.value)}
                        placeholder="เช่น พุทธศาสตรบัณฑิต (พระพุทธศาสนา) [พธ.บ.]"
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">{t("curriculum.degreeEn")}</label>
                      <input
                        type="text"
                        value={degreeEn}
                        onChange={(e) => setDegreeEn(e.target.value)}
                        placeholder="e.g. Bachelor of Arts (Buddhist Studies) [B.A.]"
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">{t("curriculum.totalCredits")}</label>
                      <input
                        type="number"
                        value={totalCredits}
                        onChange={(e) => setTotalCredits(Number(e.target.value))}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">{t("curriculum.tuitionFee")}</label>
                      <input
                        type="number"
                        value={tuitionFee}
                        onChange={(e) => setTuitionFee(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="เช่น 32000"
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">{t("curriculum.status")}</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as "OPEN" | "CLOSED" | "UPDATING")}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                      >
                        <option value="OPEN">OPEN (เปิดรับสมัคร)</option>
                        <option value="UPDATING">UPDATING (กำลังปรับปรุง)</option>
                        <option value="CLOSED">CLOSED (ปิดรับ)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: OUTCOMES (PHILOSOPHY, OBJECTIVES, PLOS) */}
              {currModalTab === "outcomes" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-brand" />
                      <span>{isTh ? "ปรัชญาของหลักสูตร" : "Program Philosophy"}</span>
                    </label>
                    <textarea
                      rows={3}
                      value={philosophy}
                      onChange={(e) => setPhilosophy(e.target.value)}
                      placeholder={
                        isTh
                          ? "เช่น จัดการศึกษาพระพุทธศาสนาบูรณาการกับศาสตร์สมัยใหม่ ผลิตบัณฑิตให้มีความรู้ดี มีศีลธรรม นำสังคมสู่สันติสุข"
                          : "Program philosophy statement..."
                      }
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-brand" />
                      <span>{isTh ? "วัตถุประสงค์ของหลักสูตร (ระบุข้อละ 1 บรรทัด)" : "Program Objectives (1 per line)"}</span>
                    </label>
                    <textarea
                      rows={5}
                      value={objectivesText}
                      onChange={(e) => setObjectivesText(e.target.value)}
                      placeholder={
                        isTh
                          ? "๑. เพื่อผลิตบัณฑิตมีความรอบรู้ในหลักพระพุทธศาสนา...\n๒. เพื่อผลิตบัณฑิตให้มีทักษะการถ่ายทอดหลักพุทธธรรม...\n๓. เพื่อผลิตบัณฑิตสามารถปฏิบัติตนตามหลักคุณธรรม..."
                          : "1. Objective 1\n2. Objective 2"
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background font-sans leading-relaxed"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      {isTh
                        ? "ระบบจะตัดขึ้นข้อใหม่ให้อัตโนมัติเมื่อขึ้นบรรทัดใหม่"
                        : "Each line represents one program objective."}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-brand" />
                      <span>
                        {isTh
                          ? "ผลลัพธ์การเรียนรู้ที่คาดหวัง (PLOs) (ระบุข้อละ 1 บรรทัด หรือใช้รูปแบบ 'PLO 1: ข้อความไทย | English')"
                          : "Program Learning Outcomes (PLOs)"}
                      </span>
                    </label>
                    <textarea
                      rows={6}
                      value={plosText}
                      onChange={(e) => setPlosText(e.target.value)}
                      placeholder={
                        "PLO 1: มีความรอบรู้ในหลักพระพุทธศาสนาและศาสตร์ที่เกี่ยวข้อง... | Demonstrate deep knowledge in Buddhist principles...\nPLO 2: มีทักษะการถ่ายทอดหลักพุทธธรรม... | Possess communication skills to convey Buddhist teachings...\nPLO 3: สามารถปฏิบัติตนตามหลักคุณธรรม จริยธรรม..."
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background font-mono leading-relaxed"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      {isTh
                        ? "สามารถคั่นคำแปลภาษาอังกฤษด้วยสัญลักษณ์ | (ไปป์) เพื่อรองรับ 2 ภาษาในหน้า Portal"
                        : "Use | pipe character to separate Thai description from English translation."}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: STRUCTURE & CAREERS */}
              {currModalTab === "structure" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-3">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-brand" />
                      <span>{isTh ? "โครงสร้างหมวดวิชาและจำนวนหน่วยกิต (ตาม มคอ. 2)" : "Course Structure by Category"}</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">
                          {isTh ? "หมวดวิชาศึกษาทั่วไป (หน่วยกิต)" : "GenEd Credits"}
                        </label>
                        <input
                          type="number"
                          value={genEdCredits}
                          onChange={(e) => setGenEdCredits(Number(e.target.value))}
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-border bg-background"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">
                          {isTh ? "หมวดวิชาเฉพาะ/สาขา (หน่วยกิต)" : "Major Credits"}
                        </label>
                        <input
                          type="number"
                          value={majorCredits}
                          onChange={(e) => setMajorCredits(Number(e.target.value))}
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-border bg-background"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">
                          {isTh ? "หมวดวิชาเลือกเสรี (หน่วยกิต)" : "Free Elective Credits"}
                        </label>
                        <input
                          type="number"
                          value={freeElectiveCredits}
                          onChange={(e) => setFreeElectiveCredits(Number(e.target.value))}
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-border bg-background"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-muted-foreground">
                        {isTh ? "รวมหน่วยกิตหมวดวิชา:" : "Computed Total:"}{" "}
                        <strong className="text-foreground">{genEdCredits + majorCredits + freeElectiveCredits}</strong>{" "}
                        {isTh ? "หน่วยกิต" : "Credits"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setTotalCredits(genEdCredits + majorCredits + freeElectiveCredits)}
                        className="text-[11px] text-brand hover:underline font-semibold cursor-pointer"
                      >
                        {isTh ? "ซิงค์ไปยังจำนวนหน่วยกิตรวม" : "Sync to Total Credits"}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-brand" />
                      <span>{isTh ? "อาชีพที่สามารถประกอบได้หลังสำเร็จการศึกษา (ระบุบรรทัดละ 1 อาชีพ)" : "Career Paths (1 per line)"}</span>
                    </label>
                    <textarea
                      rows={5}
                      value={careerPathsText}
                      onChange={(e) => setCareerPathsText(e.target.value)}
                      placeholder={
                        isTh
                          ? "นักวิชาการศาสนา / เจ้าหน้าที่ศาสนพิธี\nอนุศาสนาจารย์ (ทหาร-ตำรวจ)\nนักจัดกระบวนการเรียนรู้และสมาธิบำบัด\nนักเยียวยาจิตใจและผู้ดูแลสุขภาวะทางจิตวิญญาณ\nนักสร้างสรรค์เนื้อหาทางศาสนาและศิลปวัฒนธรรม"
                          : "Religious Affairs Officer\nMindfulness Facilitator\nSpiritual Caregiver"
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-brand" />
                      <span>{isTh ? "คุณสมบัติของผู้เข้าศึกษา" : "Admission Qualifications"}</span>
                    </label>
                    <textarea
                      rows={3}
                      value={qualifications}
                      onChange={(e) => setQualifications(e.target.value)}
                      placeholder={
                        isTh
                          ? "๑. สำเร็จการศึกษาระดับมัธยมศึกษาตอนปลาย (ม.๖) หรือเทียบเท่า ๒. เป็นไปตามระเบียบมหาวิทยาลัย..."
                          : "High school graduate or equivalent..."
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: DOCS & PDF */}
              {currModalTab === "docs" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5 text-brand" />
                      <span>{isTh ? "ลิงก์เล่มหลักสูตร มคอ. 2 (PDF)" : "TQF 2 Document URL (PDF)"}</span>
                    </label>
                    <input
                      type="text"
                      value={brochurePdfUrl}
                      onChange={(e) => setBrochurePdfUrl(e.target.value)}
                      placeholder="/documents/mko2-buddhist-studies-2570.pdf หรือ https://..."
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                    />
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setBrochurePdfUrl("/documents/mko2-buddhist-studies-2570.pdf")}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-[11px] font-medium text-foreground transition-colors cursor-pointer"
                      >
                        <span>{isTh ? "ใช้ไฟล์ มคอ. 2 พระพุทธศาสนา ๒๕๗๐" : "Use Buddhist Studies 2570 PDF"}</span>
                      </button>
                    </div>
                  </div>

                  {brochurePdfUrl && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                        <FileText className="w-4 h-4" />
                        <span>{isTh ? "พร้อมเผยแพร่และให้ดาวน์โหลดผ่าน Portal" : "Ready for download via Portal"}</span>
                      </div>
                      <a
                        href={brochurePdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
                      >
                        <span>{isTh ? "เปิดดูไฟล์" : "View File"}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                {currModalTab !== "general" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (currModalTab === "outcomes") setCurrModalTab("general");
                      else if (currModalTab === "structure") setCurrModalTab("outcomes");
                      else if (currModalTab === "docs") setCurrModalTab("structure");
                    }}
                    className="rounded-xl text-xs"
                  >
                    {isTh ? "← ย้อนกลับ" : "← Previous"}
                  </Button>
                )}
                {currModalTab !== "docs" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (currModalTab === "general") setCurrModalTab("outcomes");
                      else if (currModalTab === "outcomes") setCurrModalTab("structure");
                      else if (currModalTab === "structure") setCurrModalTab("docs");
                    }}
                    className="rounded-xl text-xs"
                  >
                    {isTh ? "ถัดไป →" : "Next →"}
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrModalOpen(false)}
                  disabled={isPending}
                  className="rounded-xl"
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  onClick={handleSaveCurriculum}
                  disabled={isPending}
                  className="rounded-xl bg-brand text-on-brand hover:bg-brand/90"
                >
                  {isPending ? "..." : t("common.save")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: CREATE / EDIT DEPARTMENT */}
      {/* ---------------------------------------------------- */}
      {deptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-foreground">
              {editingDept ? t("department.edit") : t("department.create")}
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">{t("department.code")} *</label>
                <input
                  type="text"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  placeholder="เช่น DEPT-BA"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">{t("department.nameTh")} *</label>
                <input
                  type="text"
                  value={deptNameTh}
                  onChange={(e) => setDeptNameTh(e.target.value)}
                  placeholder="เช่น ภาควิชาบริหารธุรกิจ"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">{t("department.nameEn")}</label>
                <input
                  type="text"
                  value={deptNameEn}
                  onChange={(e) => setDeptNameEn(e.target.value)}
                  placeholder="e.g. Department of Business Administration"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">{t("department.headName")}</label>
                <input
                  type="text"
                  value={deptHeadName}
                  onChange={(e) => setDeptHeadName(e.target.value)}
                  placeholder="เช่น ผศ.ดร. สมชาย บริหารเลิศ"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">{t("department.officeRoom")}</label>
                  <input
                    type="text"
                    value={deptOfficeRoom}
                    onChange={(e) => setDeptOfficeRoom(e.target.value)}
                    placeholder="เช่น อาคาร 2 ชั้น 4 (MS-240)"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">{t("department.phone")}</label>
                  <input
                    type="text"
                    value={deptPhone}
                    onChange={(e) => setDeptPhone(e.target.value)}
                    placeholder="เช่น 044-123456 ต่อ 1400"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">{t("department.email")}</label>
                  <input
                    type="email"
                    value={deptEmail}
                    onChange={(e) => setDeptEmail(e.target.value)}
                    placeholder="ba.dept@faculty.edu"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">{t("department.displayOrder")}</label>
                  <input
                    type="number"
                    value={deptDisplayOrder}
                    onChange={(e) => setDeptDisplayOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">{t("department.description")}</label>
                <textarea
                  value={deptDescription}
                  onChange={(e) => setDeptDescription(e.target.value)}
                  rows={3}
                  placeholder="รายละเอียดและภารกิจของภาควิชา..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background text-foreground"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="deptIsActive"
                  checked={deptIsActive}
                  onChange={(e) => setDeptIsActive(e.target.checked)}
                  className="rounded border-border text-brand focus:ring-brand"
                />
                <label htmlFor="deptIsActive" className="text-xs font-semibold text-foreground cursor-pointer">
                  {t("department.status.active")}
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setDeptModalOpen(false)}
                disabled={isPending}
                className="rounded-xl"
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleSaveDepartment}
                disabled={isPending}
                className="rounded-xl bg-brand text-on-brand hover:bg-brand/90"
              >
                {isPending ? "..." : t("common.save")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* DELETE CURRICULUM CONFIRM */}
      {/* ---------------------------------------------------- */}
      {deleteConfirmCurr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-lg text-foreground">{t("curriculum.delete")}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("curriculum.deleteConfirm")}: <span className="font-semibold text-foreground">{deleteConfirmCurr.nameTh}</span>
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmCurr(null)}
                disabled={isPending}
                className="rounded-xl"
              >
                {t("common.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteCurriculum(deleteConfirmCurr)}
                disabled={isPending}
                className="rounded-xl"
              >
                {isPending ? "..." : t("curriculum.delete")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* DELETE DEPARTMENT CONFIRM */}
      {/* ---------------------------------------------------- */}
      {deleteConfirmDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-lg text-foreground">{t("department.delete")}</h3>
            </div>

            {deleteConfirmDept.curriculaCount > 0 ? (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-2">
                <p className="font-semibold">{t("department.deleteHasCurriculaError")}</p>
                <p>
                  ภาควิชานี้มีหลักสูตรสังกัดอยู่ {deleteConfirmDept.curriculaCount} หลักสูตร
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("department.deleteConfirm")}:{" "}
                <span className="font-semibold text-foreground">{deleteConfirmDept.nameTh}</span>
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmDept(null)}
                disabled={isPending}
                className="rounded-xl"
              >
                {t("common.cancel")}
              </Button>
              {deleteConfirmDept.curriculaCount === 0 && (
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteDepartment(deleteConfirmDept)}
                  disabled={isPending}
                  className="rounded-xl"
                >
                  {isPending ? "..." : t("department.delete")}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
