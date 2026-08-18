/**
 * Seeded students.
 *
 * These histories are not hand-written JSON blobs. Every snapshot below is
 * produced by pushing a ContextDelta through commitDelta — the same code path a
 * live session uses — so the change logs, version numbers and evidence counts
 * are internally consistent by construction rather than by care.
 *
 * The four students exist to make one point each:
 *   Aarav — the physics is not the problem, the arithmetic is.
 *   Diya  — one wrong model, held confidently, that leaks across two classrooms.
 *   Kabir — supported performance is not independent performance.
 *   Meera — nothing known yet, so the diagnostic can be demoed live.
 */

import { commitDelta, insertStudentRaw, currentVersion } from './store';
import type { ContextDelta, MisconceptionEvidence } from './types';

type Ev = Omit<MisconceptionEvidence, 'version'>;

function ev(
  source: Ev['source'],
  item_id: string,
  item_text: string,
  student_answer: string,
  expected_answer: string,
  note: string,
  at: string,
): Ev {
  return { source, item_id, item_text, student_answer, expected_answer, note, at };
}

/* ================================================================== *
 * Aarav Menon — conceptually quick, loses marks in the arithmetic
 * ================================================================== */

const AARAV_V1: ContextDelta = {
  summary: 'Reads the physics quickly and correctly; the marks leak in the arithmetic.',
  narrative:
    'Aarav answered four of five diagnostic items correctly and moved fast — 22 seconds a question against a cohort ' +
    'median near 50. He handled the stretch item on uniform velocity without hesitation, which is unusual at entry. ' +
    'The one miss is worth more than the four hits: on the average-speed item he set the calculation up perfectly ' +
    '(total distance over total time, 90 km over 3 h) and then divided wrong. That is not a misconception, so ' +
    'nothing has been opened against him. It is an arithmetic slip, and the system will watch whether it repeats.',
  mastery_updates: [
    {
      concept_id: 'c1.s14',
      confidence: 0.82,
      trend: 'flat',
      reason:
        'Named the ant in Fig. 2.17 as uniform motion on D-02 and, unprompted, gave the straight-line condition as ' +
        'part of the reason — the condition most students drop.',
      evidence_refs: ['D-02'],
      note: 'States both conditions without being asked.',
    },
    {
      concept_id: 'c1.s15',
      confidence: 0.78,
      trend: 'flat',
      reason: 'Correctly contrasted Fig. 2.18 as non-uniform motion on D-02, citing unequal distances in equal times.',
      evidence_refs: ['D-02'],
    },
    {
      concept_id: 'c1.s5',
      confidence: 0.85,
      trend: 'flat',
      reason: 'Identified the freely falling stone and the carrom coin as rectilinear motion on D-01 with no hesitation.',
      evidence_refs: ['D-01'],
    },
    {
      concept_id: 'c1.s6',
      confidence: 0.8,
      trend: 'flat',
      reason: 'Classified the ball thrown at an angle as curvilinear on D-01, avoiding the common rectilinear trap.',
      evidence_refs: ['D-01'],
    },
    {
      concept_id: 'c2.s1',
      confidence: 0.72,
      trend: 'flat',
      reason: 'Stated v = S/t correctly and substituted correctly on D-03; the relationship itself is secure.',
      evidence_refs: ['D-03'],
    },
    {
      concept_id: 'c2.s2',
      confidence: 0.7,
      trend: 'flat',
      reason: 'Chose ms⁻¹ over ms⁻² on D-03 and wrote the index without prompting.',
      evidence_refs: ['D-03'],
    },
    {
      concept_id: 'c2.s5',
      confidence: 0.38,
      trend: 'flat',
      reason:
        'On D-04 he wrote "Average speed = total distance / total time = 90 km / 3 h" and then answered 27 km/h. ' +
        'The method is right and the division is wrong, so confidence is held low on the outcome while the setup is ' +
        'credited — this is why no average-speed misconception was opened.',
      evidence_refs: ['D-04'],
      note: 'Method secure, execution unreliable.',
    },
    {
      concept_id: 'c2.s7',
      confidence: 0.68,
      trend: 'flat',
      reason: 'On the stretch item D-06 he said speed becomes velocity "once you say which way", which is the book\'s distinction.',
      evidence_refs: ['D-06'],
    },
    {
      concept_id: 'c2.s8',
      confidence: 0.6,
      trend: 'flat',
      reason:
        'Recognised on D-06 that the car on the circular road has uniform speed but not uniform velocity, though he ' +
        'did not name both conditions explicitly.',
      evidence_refs: ['D-06'],
    },
  ],
  misconceptions_opened: [],
  misconceptions_resolved: [],
  misconceptions_persisted: [],
  profile_updates: [
    {
      field: 'pace',
      to: 'brisk',
      reason: 'Averaged 22 s per diagnostic item, less than half the time the item bank expects at this tier.',
      evidence_refs: ['D-01', 'D-02', 'D-03', 'D-04', 'D-06'],
    },
    {
      field: 'preferred_modality',
      to: 'formal',
      reason:
        'Answered in definitional language of his own accord ("equal distances, equal times, same straight line") ' +
        'rather than reaching for a picture or a story — the formal route is already working for him.',
      evidence_refs: ['D-02', 'D-06'],
    },
    {
      field: 'typical_error_type',
      to: 'careless',
      reason: 'The single error was a division slip on a correctly-formed expression, not a wrong model of the physics.',
      evidence_refs: ['D-04'],
    },
    {
      field: 'response_to_hints',
      to: 'independent',
      reason: 'Completed all five diagnostic items without opening a hint; the diagnostic offers them on every item.',
      evidence_refs: ['D-01', 'D-02', 'D-03', 'D-04', 'D-06'],
    },
  ],
  engagement_updates: {
    avg_seconds_per_question: 22,
    hint_dependency_rate: 0,
    attempts_per_question: 1,
    drop_off_points: [],
  },
};

const AARAV_V2: ContextDelta = {
  summary: 'Motion types secure at speed; the oscillatory/vibratory line is the one that gave way.',
  narrative:
    'Classroom 1 ran at stretch entry with almost no scaffolding, and that was the right call — practise came back ' +
    '5/5 with no hints taken. The check found the seam. Asked what the skin of a drum does when hammered, Aarav ' +
    'answered "oscillatory". The book is explicit that vibratory motion is the kind where the object does not move ' +
    'as a whole and changes shape, and that discrimination is now open against him. Everything else in the ' +
    'classroom moved up.',
  mastery_updates: [
    {
      concept_id: 'c1.s5',
      confidence: 0.92,
      trend: 'improving',
      reason: 'Practise c1-p1 and check c1-k1 both clean on rectilinear examples, unprompted and inside 20 seconds each.',
      evidence_refs: ['c1-p1', 'c1-k1'],
    },
    {
      concept_id: 'c1.s6',
      confidence: 0.9,
      trend: 'improving',
      reason: 'Correctly called the traffic roundabout curvilinear on c1-k2, the item written to catch the rotatory trap.',
      evidence_refs: ['c1-p2', 'c1-k2'],
    },
    {
      concept_id: 'c1.s7',
      confidence: 0.88,
      trend: 'improving',
      reason: 'Separated the potter\'s wheel from the car on a curved road on c1-p2 without a hint.',
      evidence_refs: ['c1-p2'],
    },
    {
      concept_id: 'c1.s8',
      confidence: 0.84,
      trend: 'improving',
      reason: 'Named both motions of the power drill on c1-p3 — translation and rotation — which is the full answer the book wants.',
      evidence_refs: ['c1-p3'],
    },
    {
      concept_id: 'c1.s9',
      confidence: 0.66,
      trend: 'declining',
      reason:
        'Correct on the pendulum in practise, but on check c1-k4 he applied "oscillatory" to the drum skin as well, ' +
        'so the label is being used more broadly than the book defines it.',
      evidence_refs: ['c1-p4', 'c1-k4'],
    },
    {
      concept_id: 'c1.s10',
      confidence: 0.34,
      trend: 'declining',
      reason:
        'Check c1-k4 asked what the skin of a drum describes; he answered "oscillatory motion" where the book says ' +
        'vibratory, missing that the drum skin changes shape and does not move as a whole.',
      evidence_refs: ['c1-k4'],
      note: 'Has the word but not the discriminator.',
    },
    {
      concept_id: 'c1.s11',
      confidence: 0.86,
      trend: 'improving',
      reason: 'Distinguished the wall-clock pendulum from the hockey player on c1-k3, citing the fixed interval.',
      evidence_refs: ['c1-p5', 'c1-k3'],
    },
    {
      concept_id: 'c1.s12',
      confidence: 0.82,
      trend: 'improving',
      reason: 'Same item c1-k3: correctly labelled the hockey player non-periodic rather than reaching for "random".',
      evidence_refs: ['c1-k3'],
    },
    {
      concept_id: 'c1.s14',
      confidence: 0.9,
      trend: 'improving',
      reason: 'Held the straight-line condition again on check c1-k5 when offered a circular-track distractor.',
      evidence_refs: ['c1-k5'],
    },
    {
      concept_id: 'c1.s3',
      confidence: 0.8,
      trend: 'improving',
      reason: 'Handled the bus passenger question in the tutor checkpoint, naming both reference frames unprompted.',
      evidence_refs: ['c1-learn-t4'],
    },
  ],
  misconceptions_opened: [
    {
      id: 'M-C1-03',
      name: 'Oscillatory and vibratory are swapped',
      student_model: 'Anything that moves back and forth is oscillatory; vibratory is just a faster word for the same thing.',
      concept_ids: ['c1.s9', 'c1.s10'],
      reason:
        'On check item c1-k4 he called the hammered drum skin oscillatory. He can define both terms on request, so ' +
        'this is a discrimination failure rather than a missing definition — the shape-change test is not being applied.',
      evidence: [
        ev(
          'check',
          'c1-k4',
          'The skin of a drum on being hammered describes which kind of motion?',
          'Oscillatory motion',
          'Vibratory motion',
          'Gave the correct definition of vibratory motion two turns earlier in Learn, then did not apply the shape-change test here.',
          '2026-08-04T10:41:00.000Z',
        ),
      ],
    },
  ],
  misconceptions_resolved: [],
  misconceptions_persisted: [],
  profile_updates: [
    {
      field: 'persistence_after_error',
      to: 'retries-and-repairs',
      reason:
        'When the tutor re-routed after his one practise stumble he restated the rule in his own words before ' +
        'retrying, rather than guessing again.',
      evidence_refs: ['c1-learn-t7'],
    },
  ],
  engagement_updates: {
    avg_seconds_per_question: 34,
    hint_dependency_rate: 0,
    attempts_per_question: 1.1,
    drop_off_points: [],
  },
};

const AARAV_V3: ContextDelta = {
  summary: 'Weight understood; the pattern is now unmistakably computational, not careless.',
  narrative:
    'The planner sent Aarav to Weight rather than Speed & Velocity. Weight depends on Classroom 1 and on force, not ' +
    'on velocity, so it was legally available — and it is the least arithmetic-heavy of the two, which banked a ' +
    'conceptual win while the system gathered more evidence about his computation at lower stakes. That worked. ' +
    'The definitions came back secure: weight as the force with which the earth pulls a body towards its centre, ' +
    'the spring balance against the beam balance, weight varying with g. Both misses were numerical again — the ' +
    'tonne/quintal conversion and the 100 g figure for one newton. Three sessions in, one arithmetic slip is bad ' +
    'luck and three is a pattern, so the profile has been revised from careless to computational. A retention probe ' +
    'on the drum skin was folded into this block and came back correct, so the oscillatory/vibratory confusion ' +
    'opened at v2 is now resolved.',
  mastery_updates: [
    {
      concept_id: 'c3.s1',
      confidence: 0.9,
      trend: 'improving',
      reason: 'Defined mass as the amount of matter contained in a body on c3-k1, in the book\'s words.',
      evidence_refs: ['c3-p1', 'c3-k1'],
    },
    {
      concept_id: 'c3.s5',
      confidence: 0.92,
      trend: 'improving',
      reason:
        'Gave weight as the force with which the earth pulls a body towards its centre on c3-k1 and did not reach ' +
        'for "how heavy something is".',
      evidence_refs: ['c3-p1', 'c3-k1'],
    },
    {
      concept_id: 'c3.s6',
      confidence: 0.88,
      trend: 'improving',
      reason: 'Explained on c3-k2 that weight varies because acceleration due to gravity varies, while mass does not.',
      evidence_refs: ['c3-k2'],
    },
    {
      concept_id: 'c3.s7',
      confidence: 0.85,
      trend: 'improving',
      reason: 'Answered the 2 kgf at the equator question correctly on c3-k3 — more than 2 kgf at the poles, with the reason.',
      evidence_refs: ['c3-p4', 'c3-k3'],
    },
    {
      concept_id: 'c3.s3',
      confidence: 0.87,
      trend: 'improving',
      reason: 'Picked the beam balance for mass and the spring balance for weight on c3-p2 with no hesitation.',
      evidence_refs: ['c3-p2'],
    },
    {
      concept_id: 'c3.s8',
      confidence: 0.87,
      trend: 'improving',
      reason: 'Same item c3-p2, the spring balance half; the two instruments are not being swapped.',
      evidence_refs: ['c3-p2'],
    },
    {
      concept_id: 'c3.s11',
      confidence: 0.8,
      trend: 'improving',
      reason: 'On c3-k5 he stated that mass can never be zero but weight can, and gave the condition — no acceleration due to gravity.',
      evidence_refs: ['c3-k5'],
    },
    {
      concept_id: 'c3.s4',
      confidence: 0.48,
      trend: 'declining',
      reason:
        'Asked on c3-k4 to express 1 tonne in quintals he answered 100 rather than 10. He had written "1000 kg = 10 ' +
        'quintals" correctly one line above, so the relationship was recalled and the conversion was executed wrong.',
      evidence_refs: ['c3-k4'],
      note: 'Recalls the relationship, mis-executes the conversion.',
    },
    {
      concept_id: 'c3.s10',
      confidence: 0.55,
      trend: 'flat',
      reason:
        'Named the newton as the SI unit of weight on c3-p3 but gave 1 kg rather than 100 g as the mass the earth ' +
        'pulls with one newton of force.',
      evidence_refs: ['c3-p3'],
    },
    {
      concept_id: 'c1.s10',
      confidence: 0.78,
      trend: 'improving',
      reason:
        'The retention probe c3-r1 re-asked the drum skin question seven days after he got it wrong. He answered ' +
        'vibratory and gave the shape-change reason unprompted.',
      evidence_refs: ['c3-r1'],
    },
    {
      concept_id: 'c1.s9',
      confidence: 0.84,
      trend: 'improving',
      reason: 'Same retention probe: he contrasted the drum with the swing, which is the discrimination he missed at v2.',
      evidence_refs: ['c3-r1'],
    },
  ],
  misconceptions_opened: [],
  misconceptions_resolved: [
    {
      id: 'M-C1-03',
      reason:
        'Retention probe c3-r1, seven days after the original error, asked the drum-skin question again. He answered ' +
        'vibratory and volunteered the discriminator — the object does not move as a whole and its shape changes.',
      evidence_refs: ['c3-r1'],
    },
  ],
  misconceptions_persisted: [],
  profile_updates: [
    {
      field: 'typical_error_type',
      to: 'computational',
      reason:
        'Three sessions, three wrong answers, all three arithmetic on correctly-formed expressions: 90/3 at the ' +
        'diagnostic, 1 tonne to quintals on c3-k4, and the newton figure on c3-p3. This is no longer occasional ' +
        'carelessness, it is where his working breaks, and practice should now scaffold the numbers rather than the ideas.',
      evidence_refs: ['D-04', 'c3-k4', 'c3-p3'],
    },
  ],
  engagement_updates: {
    avg_seconds_per_question: 31,
    hint_dependency_rate: 0.04,
    attempts_per_question: 1.15,
    drop_off_points: ['Skips re-reading multi-step numerical answers before submitting'],
  },
};

/* ================================================================== *
 * Diya Sharma — computation solid, one wrong model held confidently
 * ================================================================== */

const DIYA_V1: ContextDelta = {
  summary: 'Computes reliably; treats velocity as a synonym for speed.',
  narrative:
    'Diya\'s arithmetic is the strongest of the seeded cohort — she took the average-speed item cleanly, showing ' +
    '90 km over 3 h and answering 30 km/h with the unit attached. The stretch item is where the picture changed. ' +
    'Offered the car covering 5 m every second on a circular road, she said it has uniform velocity because the ' +
    'speed does not change. That is the book\'s own counterexample, Fig. 2.22, and it means direction is not yet ' +
    'part of what she thinks velocity is. Everything else she knows is sound, which is precisely what makes this ' +
    'worth targeting head-on rather than working around.',
  mastery_updates: [
    {
      concept_id: 'c2.s5',
      confidence: 0.85,
      trend: 'flat',
      reason: 'D-04 answered 30 km/h with correct working shown — total distance 90 km over total time 3 h — and the unit written.',
      evidence_refs: ['D-04'],
      note: 'Sets up and executes numerical work reliably.',
    },
    {
      concept_id: 'c2.s1',
      confidence: 0.82,
      trend: 'flat',
      reason: 'Substituted into v = S/t correctly on D-03 and rearranged without prompting.',
      evidence_refs: ['D-03'],
    },
    {
      concept_id: 'c2.s2',
      confidence: 0.8,
      trend: 'flat',
      reason: 'Chose ms⁻¹ on D-03 and carried units through the working rather than attaching them at the end.',
      evidence_refs: ['D-03'],
    },
    {
      concept_id: 'c1.s14',
      confidence: 0.72,
      trend: 'flat',
      reason: 'Named the ant in Fig. 2.17 as uniform motion on D-02, though she gave only the equal-distances half of the reason.',
      evidence_refs: ['D-02'],
    },
    {
      concept_id: 'c1.s15',
      confidence: 0.7,
      trend: 'flat',
      reason: 'Correctly contrasted Fig. 2.18 as non-uniform on D-02.',
      evidence_refs: ['D-02'],
    },
    {
      concept_id: 'c1.s5',
      confidence: 0.75,
      trend: 'flat',
      reason: 'Identified rectilinear examples correctly on D-01.',
      evidence_refs: ['D-01'],
    },
    {
      concept_id: 'c1.s6',
      confidence: 0.72,
      trend: 'flat',
      reason: 'Called the ball thrown at an angle curvilinear on D-01.',
      evidence_refs: ['D-01'],
    },
    {
      concept_id: 'c2.s7',
      confidence: 0.22,
      trend: 'flat',
      reason:
        'D-06 asked her to separate speed from velocity for a car on a circular road. She wrote "they are the same ' +
        'thing, 5 m/s both", so the specified direction is absent from her definition of velocity.',
      evidence_refs: ['D-06'],
      note: 'Direction is not yet part of what velocity means to her.',
    },
    {
      concept_id: 'c2.s8',
      confidence: 0.28,
      trend: 'flat',
      reason: 'Same item: she applied only the magnitude condition and did not test whether the direction stayed the same.',
      evidence_refs: ['D-06'],
    },
  ],
  misconceptions_opened: [
    {
      id: 'M-C2-01',
      name: 'Speed and velocity are the same thing',
      student_model: 'Velocity is just the word you use in physics for speed. Direction is extra information, not part of the quantity.',
      concept_ids: ['c2.s6', 'c2.s7', 'c2.s8'],
      reason:
        'On D-06 she stated the car on the circular road has uniform velocity because its speed does not change. ' +
        'The book\'s Fig. 2.22 exists specifically to break this, and she walked straight into it while getting ' +
        'every computational item right — so this is a wrong model, not weak ability.',
      evidence: [
        ev(
          'diagnostic',
          'D-06',
          'A car covers 5 m every second along a circular road. Is it moving with uniform speed? Uniform velocity? Explain.',
          'Both — it does 5 m every second so speed and velocity are both uniform, they are the same thing.',
          'Uniform speed yes; uniform velocity no, because the direction changes continuously.',
          'Applied the magnitude condition and never tested direction. Answered in 31 s with no hint — she is confident, not guessing.',
          '2026-07-28T09:22:00.000Z',
        ),
      ],
    },
  ],
  misconceptions_resolved: [],
  misconceptions_persisted: [],
  profile_updates: [
    {
      field: 'pace',
      to: 'steady',
      reason: 'Averaged 47 s per item with little variance — she reads the question, works, and checks once.',
      evidence_refs: ['D-01', 'D-02', 'D-03', 'D-04', 'D-06'],
    },
    {
      field: 'preferred_modality',
      to: 'worked-example-first',
      reason:
        'Her written working mirrors the layout of the book\'s worked examples line for line, which is the route ' +
        'she is already using successfully on numerical items.',
      evidence_refs: ['D-03', 'D-04'],
    },
    {
      field: 'typical_error_type',
      to: 'conceptual',
      reason: 'Her only error was a definition problem on a question with no arithmetic in it at all.',
      evidence_refs: ['D-06'],
    },
    {
      field: 'response_to_hints',
      to: 'uses-when-stuck',
      reason: 'Opened one hint across five items, on D-02, and solved it after the nudge without needing the strategy tier.',
      evidence_refs: ['D-02'],
    },
  ],
  engagement_updates: {
    avg_seconds_per_question: 47,
    hint_dependency_rate: 0.2,
    attempts_per_question: 1.2,
    drop_off_points: [],
  },
};

const DIYA_V2: ContextDelta = {
  summary: 'Motion types learned well — and the same blindness to direction surfaced again, one classroom earlier than expected.',
  narrative:
    'Classroom 1 went well on its own terms: the types of motion are largely secure and she took only two hints ' +
    'across five practise items. But the check exposed something the system did not have before. On the uniform ' +
    'motion item she accepted a body covering equal distances on a circular track as uniform motion, dropping the ' +
    '"along the same straight line" condition the book insists on. That is the same omission as her velocity error ' +
    'from the diagnostic, in a different classroom, three weeks apart. The system is no longer treating this as a ' +
    'speed-and-velocity problem. The underlying model is that direction is decoration, and it is now recorded ' +
    'against both classrooms so that Classroom 2 can attack it directly rather than re-teaching velocity from scratch.',
  mastery_updates: [
    {
      concept_id: 'c1.s5',
      confidence: 0.86,
      trend: 'improving',
      reason: 'Clean on rectilinear items in both practise and check, c1-p1 and c1-k1, unaided.',
      evidence_refs: ['c1-p1', 'c1-k1'],
    },
    {
      concept_id: 'c1.s6',
      confidence: 0.84,
      trend: 'improving',
      reason: 'Correctly called the roundabout curvilinear on c1-k2 rather than rotatory.',
      evidence_refs: ['c1-p2', 'c1-k2'],
    },
    {
      concept_id: 'c1.s7',
      confidence: 0.8,
      trend: 'improving',
      reason: 'Separated the ceiling fan from the car on a curved road on c1-p2 after one nudge hint.',
      evidence_refs: ['c1-p2'],
    },
    {
      concept_id: 'c1.s9',
      confidence: 0.82,
      trend: 'improving',
      reason: 'Correctly labelled the swing and the sewing-machine needle oscillatory on c1-p4.',
      evidence_refs: ['c1-p4'],
    },
    {
      concept_id: 'c1.s10',
      confidence: 0.76,
      trend: 'improving',
      reason: 'Got the drum skin right on c1-k4 and gave the change-of-shape reason — the discrimination Aarav missed.',
      evidence_refs: ['c1-k4'],
    },
    {
      concept_id: 'c1.s11',
      confidence: 0.8,
      trend: 'improving',
      reason: 'Distinguished periodic from non-periodic on c1-k3 using the fixed-interval test.',
      evidence_refs: ['c1-p5', 'c1-k3'],
    },
    {
      concept_id: 'c1.s14',
      confidence: 0.44,
      trend: 'declining',
      reason:
        'Confidence in uniform motion dropped 0.72 → 0.44 because check item c1-k5 offered a body covering equal ' +
        'distances in equal times around a circular track and she accepted it as uniform motion. She applied the ' +
        'equal-distances condition and dropped "along the same straight line" — the identical omission as D-06.',
      evidence_refs: ['c1-k5'],
      note: 'Applies the magnitude condition, drops the direction condition.',
    },
    {
      concept_id: 'c1.s3',
      confidence: 0.68,
      trend: 'improving',
      reason: 'Handled the bus passenger checkpoint in Learn, naming both reference frames after one re-route.',
      evidence_refs: ['c1-learn-t5'],
    },
  ],
  misconceptions_opened: [
    {
      id: 'M-C1-05',
      name: 'Uniform motion drops the straight-line condition',
      student_model: 'If a body covers equal distances in equal times it is in uniform motion. Which way it is going does not come into it.',
      concept_ids: ['c1.s14'],
      reason:
        'Check item c1-k5 was written to test exactly this and she failed it. Taken together with M-C2-01 from the ' +
        'diagnostic, this is the same wrong model appearing in two different classrooms: the direction condition is ' +
        'being systematically dropped wherever a definition contains one.',
      evidence: [
        ev(
          'check',
          'c1-k5',
          'A body covers 5 m in every second around a circular track. Is it describing uniform motion? Give your reason.',
          'Yes, uniform motion, because it covers equal distances in equal intervals of time.',
          'No — uniform motion also requires the body to move along the same straight line.',
          'Quoted half the definition accurately and did not notice the other half was missing. No hint taken; answered in 38 s.',
          '2026-08-05T11:14:00.000Z',
        ),
      ],
    },
  ],
  misconceptions_resolved: [],
  misconceptions_persisted: [
    {
      id: 'M-C2-01',
      reason:
        'Not directly probed this block, but c1-k5 shows the same omission in a classroom that does not mention ' +
        'velocity at all. The model is broader than Speed & Velocity, so it stays open and Classroom 2 will lead with it.',
      evidence_refs: ['c1-k5'],
    },
  ],
  profile_updates: [
    {
      field: 'typical_error_type',
      to: 'conceptual',
      reason:
        'Confirmed across two sessions: eleven numerical steps executed without a single arithmetic error, and both ' +
        'wrong answers were half-remembered definitions.',
      evidence_refs: ['D-06', 'c1-k5'],
    },
  ],
  engagement_updates: {
    avg_seconds_per_question: 44,
    hint_dependency_rate: 0.24,
    attempts_per_question: 1.3,
    drop_off_points: [],
  },
};

/* ================================================================== *
 * Kabir Rao — prerequisite gaps, and performance that leans on support
 * ================================================================== */

const KABIR_V1: ContextDelta = {
  summary: 'Rest and motion are secure; almost everything built on top of them is still open.',
  narrative:
    'Kabir\'s diagnostic routed downward twice, which is the path the blueprint takes when the entry item fails. He ' +
    'could not classify uniform against non-uniform motion, could not classify the ball thrown at an angle, and ' +
    'then answered the foundational rest-and-motion probe correctly and confidently. That is a useful floor: the ' +
    'base of Classroom 1 is there and the layer above it is not. The speed item came apart on both the formula and ' +
    'the unit — he wrote "50 ms" for 50 m in 5 s, which is two separate problems in one answer. Mass and weight he ' +
    'handled at a basic level, which suggests the later classroom is not out of reach once the earlier one is repaired.',
  mastery_updates: [
    {
      concept_id: 'c1.s1',
      confidence: 0.7,
      trend: 'flat',
      reason: 'D-01e answered correctly and quickly: a book on a table is at rest because its position does not change with respect to the room.',
      evidence_refs: ['D-01e'],
    },
    {
      concept_id: 'c1.s2',
      confidence: 0.68,
      trend: 'flat',
      reason: 'Same item, the motion half — he gave the flowing-water example from the book unprompted.',
      evidence_refs: ['D-01e'],
    },
    {
      concept_id: 'c1.s5',
      confidence: 0.3,
      trend: 'flat',
      reason: 'On D-01 he grouped the freely falling stone with the ball thrown at an angle, so the straight-line test is not being applied.',
      evidence_refs: ['D-01'],
    },
    {
      concept_id: 'c1.s6',
      confidence: 0.24,
      trend: 'flat',
      reason: 'D-01: called the curved path "rotatory", reaching for the word for anything that is not straight.',
      evidence_refs: ['D-01'],
    },
    {
      concept_id: 'c1.s14',
      confidence: 0.2,
      trend: 'flat',
      reason: 'D-02 was left blank after 96 seconds and two hints; the uniform/non-uniform distinction has no purchase yet.',
      evidence_refs: ['D-02'],
    },
    {
      concept_id: 'c1.s15',
      confidence: 0.2,
      trend: 'flat',
      reason: 'Same item, same outcome — neither half of the pair is available to him.',
      evidence_refs: ['D-02'],
    },
    {
      concept_id: 'c2.s1',
      confidence: 0.18,
      trend: 'flat',
      reason: 'On D-03 he multiplied 50 by 5 instead of dividing; v = S/t is not yet a relationship he can use.',
      evidence_refs: ['D-03'],
    },
    {
      concept_id: 'c2.s2',
      confidence: 0.15,
      trend: 'flat',
      reason: 'Same item: wrote the unit as "ms", which the book writes as m/s or ms⁻¹. The index is missing, not just the slash.',
      evidence_refs: ['D-03'],
    },
    {
      concept_id: 'c3.s1',
      confidence: 0.55,
      trend: 'flat',
      reason: 'D-05f: gave mass as "how much stuff is in it", which is the book\'s idea in his own words.',
      evidence_refs: ['D-05f'],
    },
    {
      concept_id: 'c3.s5',
      confidence: 0.42,
      trend: 'flat',
      reason: 'Same item: knew weight was "the earth pulling" but did not connect it to the word force.',
      evidence_refs: ['D-05f'],
    },
  ],
  misconceptions_opened: [
    {
      id: 'M-C1-02',
      name: 'Any curved path is circulatory/rotatory motion',
      student_model: 'If the path bends, it is rotating. Straight means rectilinear, anything else means rotatory.',
      concept_ids: ['c1.s6', 'c1.s7'],
      reason:
        'On D-01 he classified the ball thrown upward at an angle as rotatory motion. The book reserves rotatory ' +
        'for motion about a fixed axis without a change of position, and he is using it as a catch-all for curves.',
      evidence: [
        ev(
          'diagnostic',
          'D-01',
          'A ball is thrown upwards at an angle. What kind of motion does it describe?',
          'Rotatory motion, because it is not going straight.',
          'Curvilinear motion — the body moves along a curved line.',
          'Reasoned explicitly from "not straight", so the category is being defined by exclusion rather than by the book\'s fixed-axis test.',
          '2026-07-29T09:05:00.000Z',
        ),
      ],
    },
    {
      id: 'M-C2-05',
      name: 'Unit notation slip',
      student_model: 'Units are letters you put after the number; m and s together means metres and seconds.',
      concept_ids: ['c2.s2'],
      reason:
        'Wrote "50 ms" on D-03. Not a typo — asked to read it back in the follow-up he said "fifty metre seconds", ' +
        'so the compound unit is not being read as a division at all.',
      evidence: [
        ev(
          'diagnostic',
          'D-03',
          'A horse covers 50 m in 5 s in a straight line. State its speed with the correct unit.',
          '250 ms',
          '10 ms⁻¹ (or 10 m/s)',
          'Two errors in one answer: multiplied instead of dividing, and wrote the unit without the index.',
          '2026-07-29T09:11:00.000Z',
        ),
      ],
    },
  ],
  misconceptions_resolved: [],
  misconceptions_persisted: [],
  profile_updates: [
    {
      field: 'pace',
      to: 'deliberate',
      reason: 'Averaged 81 s per item and spent 96 s on the one he left blank — he stays with a question rather than skipping it.',
      evidence_refs: ['D-01', 'D-01e', 'D-02', 'D-03', 'D-05f'],
    },
    {
      field: 'preferred_modality',
      to: 'visual',
      reason:
        'The two items he answered correctly were the two with a figure attached, and on D-01 he drew the path ' +
        'before choosing. The picture is where he starts.',
      evidence_refs: ['D-01e', 'D-05f'],
    },
    {
      field: 'response_to_hints',
      to: 'hint-reliant',
      reason: 'Opened hints on four of five items and went to the second tier on three of them, including on items he then got wrong.',
      evidence_refs: ['D-01', 'D-02', 'D-03'],
    },
    {
      field: 'persistence_after_error',
      to: 'retries-same-way',
      reason:
        'On D-03 both attempts multiplied 50 by 5. He does not give up, but he re-runs the same method rather than ' +
        'changing it, so a re-teach has to change the route, not repeat it louder.',
      evidence_refs: ['D-03'],
    },
    {
      field: 'typical_error_type',
      to: 'conceptual',
      reason: 'The errors are not slips — the categories and the relationships themselves are not yet in place.',
      evidence_refs: ['D-01', 'D-02', 'D-03'],
    },
  ],
  engagement_updates: {
    avg_seconds_per_question: 81,
    hint_dependency_rate: 0.8,
    attempts_per_question: 1.8,
    drop_off_points: ['Leaves items blank rather than guessing once past ~90 s'],
  },
};

const KABIR_V2: ContextDelta = {
  summary: 'Real movement in Classroom 1 — but almost all of it happened with a hint open.',
  narrative:
    'This is the block that shows why the engine records how an answer was reached and not just whether it was ' +
    'right. Kabir got three of five practise items correct, which looks like progress, and he took a hint on ' +
    'every single one of them — six hints across five questions, three of which went to the worked-partial tier. ' +
    'Check, where support is removed entirely, came back 2/5. The system is therefore crediting supported ' +
    'performance and independent performance separately: rectilinear motion has genuinely moved, because he got ' +
    'it right in check with nothing open, while circulatory motion has barely moved at all despite two correct ' +
    'practise answers. The curved-path misconception survived the block intact and has now been joined by its ' +
    'sibling — he called a car on a straight road rotatory because its wheels turn. Classroom 2 is not the right ' +
    'next step for him; the planner will patch Classroom 1 first.',
  mastery_updates: [
    {
      concept_id: 'c1.s5',
      confidence: 0.62,
      trend: 'improving',
      reason:
        'Confidence rose 0.30 → 0.62 on the strength of check item c1-k1, answered correctly with no support after ' +
        'two supported practise attempts. This is the one gain in the block that was earned independently.',
      evidence_refs: ['c1-p1', 'c1-k1'],
      note: 'The only sub-concept proven without support this block.',
    },
    {
      concept_id: 'c1.s1',
      confidence: 0.82,
      trend: 'improving',
      reason: 'Answered the rest-and-motion checkpoint in Learn immediately and correctly; this base is now solid.',
      evidence_refs: ['c1-learn-t2', 'c1-k1'],
    },
    {
      concept_id: 'c1.s2',
      confidence: 0.8,
      trend: 'improving',
      reason: 'Same checkpoint — he supplied a motion example of his own rather than repeating the tutor\'s.',
      evidence_refs: ['c1-learn-t2'],
    },
    {
      concept_id: 'c1.s6',
      confidence: 0.32,
      trend: 'flat',
      reason:
        'Correct twice in practise, both times after a worked-partial hint that named the answer category, and ' +
        'wrong in check on c1-k2 where he called the roundabout rotatory. Barely moved: the practise credit is ' +
        'support, not knowledge.',
      evidence_refs: ['c1-p2', 'c1-k2'],
      note: 'Correct only when a hint has already named the category.',
    },
    {
      concept_id: 'c1.s7',
      confidence: 0.4,
      trend: 'improving',
      reason: 'Identified the ceiling fan as circulatory in check c1-k2b, which is the clearest possible case; harder cases still fail.',
      evidence_refs: ['c1-p2', 'c1-k2b'],
    },
    {
      concept_id: 'c1.s14',
      confidence: 0.34,
      trend: 'improving',
      reason:
        'Moved 0.20 → 0.34. He can now read the ant diagram and say the distances are equal, but could not finish ' +
        'the classification in check without the diagram in front of him.',
      evidence_refs: ['c1-p3', 'c1-k3'],
    },
    {
      concept_id: 'c1.s15',
      confidence: 0.3,
      trend: 'improving',
      reason: 'Same items; the non-uniform half is still weaker than the uniform half because he reads it as "the broken one".',
      evidence_refs: ['c1-p3', 'c1-k3'],
    },
    {
      concept_id: 'c1.s9',
      confidence: 0.35,
      trend: 'improving',
      reason: 'Got the swing right in practise c1-p4 after a nudge, then missed the sewing-machine needle in check c1-k4.',
      evidence_refs: ['c1-p4', 'c1-k4'],
    },
    {
      concept_id: 'c1.s10',
      confidence: 0.22,
      trend: 'flat',
      reason: 'Not reached independently at any point in the block; both practise attempts needed the worked-partial tier.',
      evidence_refs: ['c1-p4'],
    },
  ],
  misconceptions_opened: [
    {
      id: 'M-C1-09',
      name: 'The motion of a part is taken for the motion of the body',
      student_model: 'A car on a straight road is rotating, because its wheels are going round.',
      concept_ids: ['c1.s5', 'c1.s8'],
      reason:
        'On check c1-k1b he called a car on a straight road rotatory and wrote "wheels turn" as the reason. This is ' +
        'the same habit as M-C1-02 — classifying from a salient feature rather than from the body\'s own path — and ' +
        'the two should be re-taught together, not separately.',
      evidence: [
        ev(
          'check',
          'c1-k1b',
          'A car moves along a straight road. What kind of motion does the car describe?',
          'Rotatory motion — the wheels turn.',
          'Rectilinear motion. (The wheels describe simultaneous motion; the car describes rectilinear motion.)',
          'The observation about the wheels is correct and the attribution is wrong — worth crediting the noticing while correcting the target.',
          '2026-08-06T10:52:00.000Z',
        ),
      ],
    },
  ],
  misconceptions_resolved: [],
  misconceptions_persisted: [
    {
      id: 'M-C1-02',
      reason:
        'Survived a full Learn-Practise-Check block. Check c1-k2 asked about the traffic roundabout and he answered ' +
        'rotatory again, exactly as at the diagnostic nine days earlier. The visual re-teach used in Learn did not ' +
        'shift it, so the next attempt must not repeat that route.',
      evidence_refs: ['c1-k2'],
    },
    {
      id: 'M-C2-05',
      reason: 'Not probed in this block — Classroom 1 carries no units. Carried forward open into Classroom 2.',
      evidence_refs: [],
    },
  ],
  profile_updates: [
    {
      field: 'response_to_hints',
      to: 'hint-reliant',
      reason:
        'Six hints across five practise items, three of them taken to the worked-partial tier, and a 40-point gap ' +
        'between supported and unsupported accuracy. Practice for him has to fade support deliberately rather than offer it freely.',
      evidence_refs: ['c1-p1', 'c1-p2', 'c1-p3', 'c1-p4', 'c1-p5'],
    },
    {
      field: 'persistence_after_error',
      to: 'retries-same-way',
      reason:
        'Confirmed: on c1-p2 both wrong attempts gave "rotatory" for the same reason. He will keep trying, but a ' +
        're-teach that repeats the modality he just failed will not land.',
      evidence_refs: ['c1-p2'],
    },
  ],
  engagement_updates: {
    avg_seconds_per_question: 78,
    hint_dependency_rate: 0.87,
    attempts_per_question: 2.4,
    drop_off_points: [
      'Word problems longer than about 60 s',
      'Takes the third hint tier without re-reading the second',
    ],
  },
};

/* ================================================================== *
 * Runner
 * ================================================================== */

type SeedStudent = {
  id: string;
  name: string;
  grade: number;
  board: string;
  section: string;
  created_at: string;
  steps: { delta: ContextDelta; trigger: 'diagnostic' | 'classroom-complete'; classroom: string | null; at: string }[];
};

export const SEED_STUDENTS: SeedStudent[] = [
  {
    id: 'stu_aarav',
    name: 'Aarav Menon',
    grade: 7,
    board: 'ICSE',
    section: '7-B',
    created_at: '2026-07-28T09:00:00.000Z',
    steps: [
      { delta: AARAV_V1, trigger: 'diagnostic', classroom: null, at: '2026-07-28T09:18:00.000Z' },
      { delta: AARAV_V2, trigger: 'classroom-complete', classroom: 'c1-motion-and-types-of-motion', at: '2026-08-04T10:45:00.000Z' },
      { delta: AARAV_V3, trigger: 'classroom-complete', classroom: 'c3-weight', at: '2026-08-11T10:38:00.000Z' },
    ],
  },
  {
    id: 'stu_diya',
    name: 'Diya Sharma',
    grade: 7,
    board: 'ICSE',
    section: '7-B',
    created_at: '2026-07-28T09:00:00.000Z',
    steps: [
      { delta: DIYA_V1, trigger: 'diagnostic', classroom: null, at: '2026-07-28T09:26:00.000Z' },
      { delta: DIYA_V2, trigger: 'classroom-complete', classroom: 'c1-motion-and-types-of-motion', at: '2026-08-05T11:20:00.000Z' },
    ],
  },
  {
    id: 'stu_kabir',
    name: 'Kabir Rao',
    grade: 7,
    board: 'ICSE',
    section: '7-B',
    created_at: '2026-07-29T09:00:00.000Z',
    steps: [
      { delta: KABIR_V1, trigger: 'diagnostic', classroom: null, at: '2026-07-29T09:19:00.000Z' },
      { delta: KABIR_V2, trigger: 'classroom-complete', classroom: 'c1-motion-and-types-of-motion', at: '2026-08-06T11:02:00.000Z' },
    ],
  },
  {
    id: 'stu_meera',
    name: 'Meera Iyer',
    grade: 7,
    board: 'ICSE',
    section: '7-B',
    created_at: '2026-08-17T08:30:00.000Z',
    steps: [],
  },
];

/** Idempotent: students that already have context are left alone. */
export function seedIfEmpty(): { seeded: string[]; skipped: string[] } {
  const seeded: string[] = [];
  const skipped: string[] = [];

  for (const s of SEED_STUDENTS) {
    insertStudentRaw({
      id: s.id,
      name: s.name,
      grade: s.grade,
      board: s.board,
      section: s.section,
      created_at: s.created_at,
      last_activity_at: s.steps.length ? s.steps[s.steps.length - 1].at : null,
    });

    if (currentVersion(s.id) > 0) {
      skipped.push(s.name);
      continue;
    }
    for (const step of s.steps) {
      commitDelta(s.id, step.delta, {
        trigger: step.trigger,
        source_classroom_id: step.classroom,
        at: step.at,
      });
    }
    seeded.push(`${s.name} (v${s.steps.length})`);
  }
  return { seeded, skipped };
}
