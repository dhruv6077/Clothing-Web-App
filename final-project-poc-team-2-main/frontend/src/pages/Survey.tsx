import { CreateSurveyRequest, createSurveyResponse } from "@/api/surveyApi";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  useForm,
  FormProvider,
  useFormContext,
  SubmitHandler,
} from "react-hook-form";
import { useNavigate } from "react-router";

interface SurveyProps {
  user: string;
}

/**
 * We define one field per question: q1…q16
 * All are single‐choice except in Q5.c we let you pick multiple sub‐options,
 * which we collect in q5sub.
 */
interface FormValues {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
  q8: string;
  q9: string;
  q10: string;
  q11: string;
  q12: string;
  q13: string;
  q14: string;
  q15: string;
  q16: string;
}

/** our question bank */
const questions: {
  name: keyof FormValues;
  label: string;
  options: { value: string; label: string }[];
  multiple?: boolean;
}[] = [
  {
    name: "q1",
    label:
      "Which of these best describes how you want others to view your style?",
    options: [
      { value: "casual", label: "Effortlessly cool" },
      { value: "formal", label: "Professional & Polished" },
      { value: "streetwear", label: "Unapologetically creative" },
      //{ value: "everything", label: "I wear anything that has shapes (all patterns)",},
    ],
  },
  {
    name: "q2",
    label: "How do you feel being the center of attention in social settings?",
    options: [
      {
        value: "streetwear_poly",
        label: "Love it!",
      },
      {
        value: "casual_denim",
        label: "It’s okay, I guess.",
      },
      {
        value: "minimalist",
        label:
          "I HATE IT! I’d rather just blend in.",
      },
    ],
  },
  {
    name: "q3",
    label: "What factor do you think most about when shopping?",
    options: [
      {
        value: "aesthetic",
        label:
          "Aesthetic",
      },
      {
        value: "comfort",
        label: "Comfort",
      },
      {
        value: "practicality",
        label: "Practicality",
      },
    ],
  },
  {
    name: "q4",
    label: "Why do you typically buy new clothes?",
    options: [
      { value: "$30-50", label: "As a gift to myself" },
      {
        value: "$0-20",
        label: "Simply to replace old clothes",
      },
      {
        value: "$60+",
        label: "There’s an event coming up and I need some threads!",
      },
    ],
  },
  {
    name: "q5",
    label: "How do you choose your color scheme when shopping?",
    options: [
        {
        value: "neutral",
        label:
          "Neutral tones that can match with everything",
      },
      {
        value: "contrast",
        label: "I choose colors that complement or contrast with my skin tone (e.g. jewel tones or light neutrals)",
      },
      { value: "mood",
        label: "It depends on my mood – sometimes I go bold, sometimes soft pastels",
      },
      //{value: "everything",label: "I only wear tie dye (all colors)",},
    ],
  },
  {
    name: "q6",
    label: "You’re packing for a weekend trip. What’s your outfit theme?",
    options: [
      { value: "formal_silk", label: "Chic & Modern" },
      {
        value: "street_denim",
        label: "Funky & Vintage",
      },
      {
        value: "casual_active",
        label: "Chill & sporty",
      },
    ],
  },
  {
    name: "q7",
    label: "What do you enjoy doing in your free time on a typical weekday?",
    options: [
      { value: "active", label: "Being active (cotton/spandex/polyester)" },
      { value: "home", label: "Unwinding at home (flannel/cotton)" },
      { value: "creating", label: "Creating things (silk/denim/knit)" },
      { value: "night", label: "Night on the town (silk/leather)" },
    ],
  },
  /*
  {
    name: "q8",
    label: "What season would you consider the most “you?”",
    options: [
      {
        value: "winter",
        label: "Winter (formal/streetwear, wool/faux leather, dark neutrals)",
      },
      {
        value: "spring",
        label: "Spring (streetwear/casual, cotton/linen, pastels)",
      },
      {
        value: "summer",
        label: "Summer (casual, light cotton, brights/white)",
      },
      {
        value: "autumn",
        label: "Autumn (minimalist, wool/corduroy, earth tones)",
      },
    ],
  },
  */
  {
    name: "q9",
    label: "Do you typically dress to match your emotions?",
    options: [
      {
        value: "always",
        label: "ALWAYS!",
      },
      {
        value: "sometimes",
        label: "Sometimes!",
      },
      {
        value: "rarely",
        label: "Rarely. I don’t think often about it.",
      },
      { value: "never", label: "Nah, never ever." },
    ],
  },
  {
    name: "q10",
    label: "Which of these spaces feels the most like YOU?",
    options: [
      { value: "cottage", label: "A cozy cottage in the woods" },
      { value: "studio", label: "A downtown art studio" },
      { value: "beach", label: "A nice spot by the beach" },
      { value: "cafe", label: "A bookstore cafe in the city" },
    ],
  },
  {
    name: "q11",
    label:
      "What would you prioritize as a centerpiece if you were told to build an outfit?",
    options: [
      { value: "graphic", label: "A loud graphic print" },
      { value: "solid", label: "A timeless solid color" },
      {
        value: "pattern",
        label: "A playful pattern like stripes or checks",
      },
    ],
  },
  /*
  {
    name: "q12",
    label: "How often do you need clothes for special occasions?",
    options: [
      { value: "weekly", label: "Weekly or more ($10-$50)" },
      { value: "monthly", label: "Monthly ($20-$40)" },
      { value: "rarely", label: "Rarely. I live in basics ($1-$20)" },
      { value: "funsies", label: "I dress up just for fun! ($75+)" },
    ],
  },
  */
  {
    name: "q13",
    label: "If your clothing were a form of art, it would be:",
    options: [
      { value: "graffiti", label: "Graffiti" },
      { value: "landscape", label: "Bob Ross–style landscape" },
      { value: "collage", label: "A collage" },
    ],
  },
  /*
  {
    name: "q14",
    label: "Which piece makes or breaks your outfit?",
    options: [
      { value: "bottom", label: "Pants/Skirt (denim/faux leather)" },
      { value: "top", label: "Top/Shirt (cotton/silk/linen)" },
      { value: "layer", label: "Jacket/Layering piece (wool/corduroy)" },
    ],
  },=
  */
  {
    name: "q15",
    label: "How do you react to clothes that feel “too much”?",
    options: [
      {
        value: "love",
        label: "I love dramatic texture/structure (streetwear)",
      },
      { value: "tolerate", label: "I tolerate it (casual)" },
      { value: "avoid", label: "I typically avoid it (minimalist)" },
      { value: "ignore", label: "I ignore it (basicwear)" },
      //{ value: "everything", label: "I feel nothing (all materials)" },
    ],
  },
  {
    name: "q16",
    label: "What price range do you typically spend on clothing?",
    options: [
      { value: "0-40", label: "$0-$40" },
      { value: "40-70", label: "$40-$70" },
      { value: "70+", label: "#70+" },
    ],
  },
];

/** single question renderer */
function QuestionInput({
  q,
  total,
}: {
  q: (typeof questions)[number];
  total: number;
}) {
  const { register, formState } = useFormContext<FormValues>();
  const error = formState.errors[q.name];

  console.log(total);

  return (
    <div className="pt-4">
      <p>
        <strong className="text-xl">{q.label}</strong>
      </p>
      <div className="pb-4"></div>
      {q.options.map((opt) => (
        <div
          key={opt.value}
          className="flex items-center mb-2 border border-neutral-100 p-2 rounded shadow"
        >
          {q.multiple ? (
            <label>
              <input type="checkbox" value={opt.value} {...register(q.name)} />{" "}
              {opt.label}
            </label>
          ) : (
            <label>
              <input
                type="radio"
                value={opt.value}
                {...register(q.name, { required: "This question is required" })}
              />{" "}
              {opt.label}
            </label>
          )}
        </div>
      ))}
      {error && !q.multiple && (
        <p style={{ color: "red" }}>
          {(error as any).message /* React-Hook-Form type quirk */}
        </p>
      )}
    </div>
  );
}

export const SurveyPage: React.FC<SurveyProps> = ({ user }) => {
  const methods = useForm<FormValues>({
    mode: "onBlur",
    defaultValues: {},
  });

  const [pg, setPg] = useState(0);
  const qPerPg = 4;
  const total = Math.ceil(questions.length / qPerPg);

  const currQ = questions.slice(pg * qPerPg, (pg + 1) * qPerPg);

  const back = () => setPg((s) => Math.max(s - 1, 0));

  const next = async () => {
    const name = currQ.map(q => q.name);
    const valid = await methods.trigger(name);
    if (valid) setPg((s) => Math.min(s + 1, total - 1));
  };

  const navigate = useNavigate();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    console.log("Survey complete:", data);
    const payload: CreateSurveyRequest = {
      userId: user || "",
      answers: Object.entries(data).map(([key, value]) => ({
        question: key,
        answer: value,
      })),
    };

    const result = await createSurveyResponse(payload);
    if (result.success) {
      // you can navigate to wherever makes sense:
      // - a "Thank you" page
      // - the survey you just created:
      navigate("/curatedclothing", { state: { survey: data }, replace: true });
    } else {
      // show an error toast, inline message, whatever
      console.error(result.error);
    }
  };

  const pageProgPct = ((pg + 1) / total) * 100;
  
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="w-full max-w-3xl m-auto py-10 min-h-screen">
        <div className="mb-6">
          <div className="text-gray-700 text-center text-lg mb-4">
            Page {pg + 1} of {total}
          </div>
          <div className="w-full h-3 rounded-full bg-gray-200">
            <div 
              className="rounded-full h-3 bg-black" 
              
              style={{ width: `${pageProgPct}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-5">
          {currQ.map((question) => (
            <div className="border rounded-lg p-6 shadow-md text-lg border-gray-300 " key={question.name}>
              <QuestionInput q={question} total={questions.length} />
            </div>
          ))}
        </div>


        <div className="flex mt-5 justify-between">
          <Button
            type="button"
            variant={"ghost"}
            onClick={back}
            disabled={pg === 0}
          >
            Back
          </Button>
          {pg < total - 1 ? (
            <Button
              type="button"
              onClick={next}
              variant={"default"}
              className="bg-black text-white hover:bg-gray-700"
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              className="bg-black text-white hover:bg-gray-700"
            >
              Submit
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
};
