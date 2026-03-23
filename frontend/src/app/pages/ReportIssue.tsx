import { useState, type ChangeEvent, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  ImagePlus,
  LocateFixed,
  MapPin,
  Shield,
  Trash2,
  Wrench,
  Droplets,
  AlertTriangle,
  HardHat,
  Lightbulb,
  Plus,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { appwriteService } from "../appwriteService";
import { account } from "../appwrite";

// Mirrors backend MOCK_MANAGERS — used for live preview only
const MANAGER_STATE_MAP: { keywords: string[]; state: string; managers: { id: string; name: string }[] }[] = [
  {
    state: "Delhi",
    keywords: ["delhi", "new delhi", "nd", "ndmc", "delhite"],
    managers: [
      { id: "MGR-DEL-01", name: "Sanjay Sharma" },
      { id: "MGR-DEL-02", name: "Meena Kumari" },
      { id: "MGR-DEL-03", name: "Rajesh Tyagi" },
      { id: "MGR-DEL-04", name: "Anita Singh" },
      { id: "MGR-DEL-05", name: "Amit Goel" },
    ],
  },
  {
    state: "Uttar Pradesh",
    keywords: ["uttar pradesh", "up", "lucknow", "kanpur", "varanasi", "agra", "meerut", "noida", "ghaziabad", "prayagraj", "allahabad", "bareilly", "gorakhpur"],
    managers: [
      { id: "MGR-UP-01", name: "Yash Pal" },
      { id: "MGR-UP-02", name: "Priti Yadav" },
      { id: "MGR-UP-03", name: "Manoj Mishra" },
      { id: "MGR-UP-04", name: "Renu Devi" },
      { id: "MGR-UP-05", name: "Suresh Chandra" },
      { id: "MGR-UP-06", name: "Kiran Singh" },
      { id: "MGR-UP-07", name: "Deepak Rawat" },
      { id: "MGR-UP-08", name: "Alka Jha" },
      { id: "MGR-UP-09", name: "Vikrant Tomar" },
      { id: "MGR-UP-10", name: "Sudhir Maurya" },
    ],
  },
];

const categories = [
  { id: "Garbage", icon: Trash2, description: "Overflow, dumping, litter" },
  { id: "Streetlight", icon: Lightbulb, description: "Lights not working" },
  { id: "Pothole", icon: Wrench, description: "Road or footpath damage" },
  { id: "Water", icon: Droplets, description: "Burst pipe or low supply" },
  {
    id: "Sanitation",
    icon: AlertTriangle,
    description: "Drain, sewage, toilet issue",
  },
  {
    id: "Construction",
    icon: HardHat,
    description: "Illegal work or debris",
  },
  { id: "Safety", icon: Shield, description: "Hazards and risks" },
  { id: "Other", icon: MapPin, description: "Any other civic issue" },
];

const subcategories: Record<string, string[]> = {
  Pothole: ["Road", "Footpath", "Bridge", "Parking Area"],
  Garbage: ["Overflow", "Illegal Dumping", "Litter", "Dead Animal"],
  Streetlight: ["Main Road", "Residential Lane", "Underpass", "Park"],
  Water: ["Supply Failure", "Pipe Burst", "Contamination", "Low Pressure"],
  Sanitation: [
    "Drainage Clog",
    "Sewage Overflow",
    "Public Toilet",
    "Manhole Issue",
  ],
  Construction: ["Illegal Building", "Road Damage", "Encroachment", "Debris"],
  Safety: ["Exposed Wires", "Tree Fall Risk", "Broken Barrier", "Open Manhole"],
  Other: ["Noise", "Animal Menace", "Illegal Parking", "General"],
};

type Step = 1 | 2 | 3 | 4 | 5;

function getManagerPreview(text: string): { state: string; manager: { id: string; name: string } } | null {
  const lower = text.toLowerCase();
  for (const group of MANAGER_STATE_MAP) {
    if (group.keywords.some((kw) => lower.includes(kw))) {
      // Pick a random-seeming but deterministic manager (first one as preview)
      return { state: group.state, manager: group.managers[0] };
    }
  }
  return null;
}

export default function ReportIssue() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null,
  );
  const [description, setDescription] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [locationDetected, setLocationDetected] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [address, setAddress] = useState("");
  const [area, setArea] = useState("");
  const [pincode, setPincode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complaintId, setComplaintId] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [assignedManagerName, setAssignedManagerName] = useState("");

  // Live manager preview — recomputed whenever address/area text changes
  const managerPreview = useMemo(
    () => getManagerPreview(`${address} ${area}`),
    [address, area],
  );

  const steps = ["Category", "Location", "Details", "Photos", "Done"];

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    if (uploadedPhotos.length + files.length > 5) {
      toast.error("You can only upload up to 5 photos in total.");
      event.target.value = "";
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const photoUrls: string[] = [];
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/heic",
      ];

      for (const file of Array.from(files)) {
        if (!allowedTypes.includes(file.type)) {
          toast.error(
            `Invalid file type: ${file.name}. Only images are allowed.`,
          );
          continue;
        }

        try {
          const photoUrl = await appwriteService.uploadPhoto(file);
          if (photoUrl) photoUrls.push(photoUrl);
        } catch (error: any) {
          toast.error(`Could not upload ${file.name}: ${error.message}`);
        }
      }

      if (photoUrls.length > 0) {
        setUploadedPhotos((prev) => [...prev, ...photoUrls]);
      }
    } catch (error: any) {
      toast.error(error.message || "Upload failed.");
    } finally {
      setIsUploadingPhoto(false);
      event.target.value = "";
    }
  };

  const handleManualGeocode = async (
    manualAddress: string,
    manualArea: string,
  ) => {
    if (!manualAddress && !manualArea) return;
    const fullSearch = `${manualAddress} ${manualArea}`.trim();
    if (fullSearch.length < 5) return;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullSearch)}&key=AIzaSyAc0wUSsARYzaJZUWX15rgxtvTS0Wd8mMs`,
      );
      const data = await response.json();
      if (data.status === "OK" && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        setCoords({ lat, lng });
      }
    } catch (error) {
      console.error("Manual geocoding failed:", error);
    }
  };

  const handleDetectLocation = () => {
    setIsDetectingLocation(true);

    if (!("geolocation" in navigator)) {
      toast.error("Geolocation is not supported by your browser.");
      setIsDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });

        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyAc0wUSsARYzaJZUWX15rgxtvTS0Wd8mMs`,
          );
          const data = await response.json();

          if (data.status === "OK" && data.results.length > 0) {
            const result = data.results[0];
            const components = result.address_components;
            const premise = components.find((c: any) =>
              c.types.includes("premise"),
            )?.long_name;
            const subpremise = components.find((c: any) =>
              c.types.includes("subpremise"),
            )?.long_name;
            const pointOfInterest = components.find((c: any) =>
              c.types.includes("point_of_interest"),
            )?.long_name;
            const route = components.find((c: any) =>
              c.types.includes("route"),
            )?.long_name;
            const locationName =
              pointOfInterest ||
              premise ||
              subpremise ||
              route ||
              result.formatted_address.split(",")[0];

            setAddress(locationName);

            const areaComponent =
              components.find((c: any) =>
                c.types.includes("sublocality_level_1"),
              ) ||
              components.find((c: any) => c.types.includes("sublocality")) ||
              components.find((c: any) => c.types.includes("locality"));

            if (areaComponent) setArea(areaComponent.long_name);

            const pinComponent = components.find((c: any) =>
              c.types.includes("postal_code"),
            );
            if (pinComponent) setPincode(pinComponent.long_name);
          } else {
            setAddress(
              `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            );
          }
        } catch (error) {
          console.error("Geocoding failed:", error);
          setAddress(
            `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          );
        }

        setLocationDetected(true);
        setIsDetectingLocation(false);
        toast.success("Location detected.");
      },
      (error) => {
        let errorMessage =
          "Could not detect location. Please enter it manually.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage =
            "Location access was denied. Please allow location permission.";
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "Location detection timed out. Please try again.";
        }
        toast.error(errorMessage);
        setLocationDetected(false);
        setIsDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const user = await account.get();
      const payload = {
        category: selectedCategory || "Other",
        subcategory: selectedSubcategory || "",
        description: description.trim() || "No description provided",
        address: `${address}${area ? `, ${area}` : ""}${pincode ? ` - ${pincode}` : ""}`,
        coordinates: coords ? { lat: coords.lat, lng: coords.lng } : null,
        photos: uploadedPhotos,
        ward: area || "General",
        reporterName: user.name || "Anonymous",
        reporterId: user.$id || "anon",
      };

      const result = await appwriteService.createComplaint(payload as any);
      // result may be a string (id) or object {id, assignedManager}
      const newId = typeof result === "string" ? result : (result as any).id;
      const mgr = typeof result === "object" ? (result as any).assignedManager : (managerPreview?.manager.name || "");
      setComplaintId(newId);
      setAssignedManagerName(mgr);
      setStep(5);
      toast.success("Complaint submitted successfully.");
    } catch (error: any) {
      toast.error(`Submission failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-sky-50 to-blue-100 px-6 py-7 shadow-sm">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-sky-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </button>
        <div className="space-y-2">
          <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-100">
            Report issue
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Report a civic issue
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            A short, guided form to report the problem clearly. The flow is
            simple: choose type, add location, describe it, and upload photos if
            needed.
          </p>
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-5">
          {steps.map((label, index) => {
            const current = index + 1;
            const active = step === current;
            const complete = step > current;

            return (
              <div
                key={label}
                className={`rounded-2xl border px-4 py-3 text-sm transition-all duration-300 ${
                  active
                    ? "border-sky-300 bg-sky-200 text-sky-900 shadow-md"
                    : complete
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                <div
                  className={`text-[10px] font-bold uppercase tracking-widest ${active ? "text-sky-800" : "text-slate-400"}`}
                >
                  Step {current}
                </div>
                <div className="mt-0.5 font-bold tracking-tight">{label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {step === 1 && (
        <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Choose category
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Pick the issue type first so the complaint goes to the right team.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map(({ id, icon: Icon, description }) => (
              <button
                key={id}
                onClick={() => {
                  setSelectedCategory(id);
                  setSelectedSubcategory(null);
                }}
                className={`group rounded-3xl border p-5 text-left transition-all duration-300 ${
                  selectedCategory === id
                    ? "border-sky-400 bg-sky-200 text-sky-950 shadow-md ring-4 ring-sky-500/10"
                    : "border-slate-100 bg-white hover:border-sky-200 hover:bg-sky-50/50 hover:shadow-lg"
                }`}
              >
                <div
                  className={`mb-4 inline-flex rounded-2xl p-2.5 transition-colors ${
                    selectedCategory === id
                      ? "bg-sky-600 text-white"
                      : "bg-sky-50 text-sky-700 group-hover:bg-white group-hover:shadow-sm"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div
                  className={`text-base font-bold tracking-tight ${selectedCategory === id ? "text-sky-950" : "text-slate-900"}`}
                >
                  {id}
                </div>
                <div
                  className={`mt-1.5 text-sm leading-relaxed ${selectedCategory === id ? "text-sky-800" : "text-slate-500"}`}
                >
                  {description}
                </div>
              </button>
            ))}
          </div>

          {selectedCategory && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-slate-700">
                Choose subcategory
              </h3>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {(subcategories[selectedCategory] || []).map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubcategory(sub)}
                    className={`rounded-2xl px-5 py-3 text-sm font-bold transition-all duration-300 ${
                      selectedSubcategory === sub
                        ? "bg-sky-600 text-white shadow-md ring-4 ring-sky-600/10"
                        : "bg-white border border-slate-200 text-slate-600 hover:border-sky-300 hover:bg-sky-50"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedCategory || !selectedSubcategory}
              className="inline-flex items-center gap-2 rounded-full bg-sky-700 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Add location</h2>
          <p className="mt-1 text-sm text-slate-500">
            Share your location automatically or enter it manually.
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div className="rounded-2xl bg-sky-50 p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <LocateFixed className="h-4 w-4 text-sky-700" />
                Current location
              </div>
              <p className="mt-2 text-sm text-slate-500">
                This helps map the issue faster and improves routing.
              </p>
              <button
                onClick={handleDetectLocation}
                disabled={isDetectingLocation}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-sky-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isDetectingLocation ? "Detecting..." : "Use my location"}
              </button>
              <div className="mt-4 text-sm text-slate-600">
                {coords
                  ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
                  : "No coordinates added yet"}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Address or landmark
                </label>
                <input
                  value={address}
                  onChange={(event) => {
                    setAddress(event.target.value);
                    if (!locationDetected) setLocationDetected(true);
                  }}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400"
                  placeholder="House number, street, building, landmark"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Area or locality
                  </label>
                  <input
                    value={area}
                    onChange={(event) => {
                      setArea(event.target.value);
                      if (!locationDetected) setLocationDetected(true);
                    }}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400"
                    placeholder="Required"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Pincode
                  </label>
                  <input
                    value={pincode}
                    onChange={(event) => {
                      setPincode(event.target.value);
                      if (!locationDetected) setLocationDetected(true);
                    }}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Manager Assignment Preview */}
          {managerPreview && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white">
                <UserCheck className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-sky-700">Will be assigned to</div>
                <div className="mt-0.5 text-base font-bold text-slate-900">{managerPreview.manager.name}</div>
                <div className="text-xs text-slate-500">{managerPreview.state} — one of {MANAGER_STATE_MAP.find(g => g.state === managerPreview.state)?.managers.length ?? 1} managers handling this region</div>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-sky-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={async () => {
                if (!coords) await handleManualGeocode(address, area);
                setStep(3);
              }}
              disabled={!area.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-sky-700 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Describe the issue
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Keep it short and practical. Mention what is happening and why it
            matters.
          </p>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value.slice(0, 500))
            }
            rows={4}
            className="mt-6 w-full rounded-3xl border border-slate-200 px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-sky-400"
            placeholder="Example: There is a large pothole near the main gate of the school. It is causing traffic and is dangerous for bikes."
          />

          <div className="mt-2 text-right text-xs text-slate-400">
            {description.length} / 500
          </div>

          <div className="mt-6 rounded-2xl bg-sky-50 p-4 text-sm text-slate-600">
            Your report details are used only to process and route the issue.
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-sky-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-2 rounded-full bg-sky-700 px-5 py-3 text-sm font-semibold text-white"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Add photos</h2>
          <p className="mt-1 text-sm text-slate-500">
            Photos are optional, but they help verify the issue quickly.
          </p>

          <div className="mt-6 flex flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-slate-200 bg-slate-50/50 p-10 transition-all hover:bg-white hover:border-sky-300 group">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
              disabled={isUploadingPhoto || uploadedPhotos.length >= 5}
            />
            <label
              htmlFor="photo-upload"
              className={`flex flex-col items-center justify-center cursor-pointer text-center ${uploadedPhotos.length >= 5 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-sky-700 shadow-sm transition-transform group-hover:scale-110">
                <ImagePlus className="h-8 w-8" />
              </div>
              <div className="text-lg font-bold text-slate-900">
                {uploadedPhotos.length >= 5 ? "Limit reached" : "Upload images"}
              </div>
              <p className="mt-2 text-sm text-slate-500 max-w-[240px]">
                {uploadedPhotos.length >= 5
                  ? "You have already added 5 photos"
                  : "Tap to select up to 5 photos from your gallery or camera"}
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-sky-700 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-900/10">
                <Plus className="h-3.5 w-3.5" /> Select Files
              </div>
            </label>
          </div>

          {isUploadingPhoto && (
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-sky-50 px-5 py-4 text-sm font-medium text-sky-800 animate-pulse">
              <div className="h-2 w-2 rounded-full bg-sky-700 animate-bounce" />
              Processing and uploading photos...
            </div>
          )}

          {uploadedPhotos.length > 0 && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {uploadedPhotos.map((photoUrl) => (
                <div
                  key={photoUrl}
                  className="overflow-hidden rounded-2xl border border-slate-200"
                >
                  <img
                    src={photoUrl}
                    alt="Evidence"
                    className="h-40 w-full object-cover"
                  />
                  <button
                    onClick={() =>
                      setUploadedPhotos((prev) =>
                        prev.filter((url) => url !== photoUrl),
                      )
                    }
                    className="w-full border-t border-slate-200 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Remove photo
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-sky-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-sky-700 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmitting ? "Submitting..." : "Submit report"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {step === 5 && (
        <section className="rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-slate-900">
            Report submitted
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Your issue has been added successfully. You can now track its status
            from the complaints page.
          </p>
          <div className="mx-auto mt-6 max-w-sm space-y-3">
            <div className="rounded-2xl bg-sky-50 px-5 py-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                Ticket ID
              </div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">
                {complaintId}
              </div>
            </div>
            {assignedManagerName && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-left">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">Assigned Manager</div>
                  <div className="mt-0.5 text-base font-bold text-slate-900">{assignedManagerName}</div>
                </div>
              </div>
            )}
          </div>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={() =>
                navigate(
                  complaintId
                    ? `/dashboard/complaints/${complaintId}`
                    : "/dashboard/complaints",
                )
              }
              className="rounded-full bg-sky-700 px-5 py-3 text-sm font-semibold text-white"
            >
              Track complaint
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to home
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
