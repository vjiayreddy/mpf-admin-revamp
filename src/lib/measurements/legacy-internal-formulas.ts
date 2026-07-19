export const outShirtLengthFormula = {
  output_attribute: "out_shirt_length",
  operations: [
    {
      sortOrder: 1,
      operation: "SUB",
      attributeA: "in_shirt_length",
      attributeB: null,
      hasConstant: 0.5,
      considerPerviousValue: false,
    },
  ],
};

// Shirt chest formulas

export const shirtChestReadyFormula = {
  output_attribute: "shirt_chest_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "shirt_chest_body",
      attributeB: "shirt_chest_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const shirtFromHalfChestFormula = {
  output_attribute: "shirt_from_half_chest",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "shirt_chest_ready",
      attributeB: "",
      hasConstant: 1,
      considerPerviousValue: false,
    },

    {
      sortOrder: 2,
      operation: "ADD",
      attributeA: "",
      attributeB: "",
      hasConstant: 1.5,
      considerPerviousValue: true,
    },

    {
      sortOrder: 3,
      operation: "DIVIDE",
      attributeA: "",
      attributeB: "",
      hasConstant: 4,
      considerPerviousValue: true,
    },
    {
      sortOrder: 4,
      operation: "ROUND",
      attributeA: "",
      attributeB: "",
      hasConstant: 0.25,
      considerPerviousValue: true,
    },
  ],
};
export const shirtBackChestFormula = {
  output_attribute: "shirt_back_chest",
  operations: [
    {
      sortOrder: 1,
      operation: "MULTIPLY",
      attributeA: "shirt_from_half_chest",
      attributeB: "",
      hasConstant: 2,
      considerPerviousValue: false,
    },
    {
      sortOrder: 2,
      operation: "SUB",
      attributeA: "",
      attributeB: "shirt_chest_ready",
      hasConstant: 0,
      considerPerviousValue: true,
    },
    {
      sortOrder: 3,
      operation: "ADD",
      attributeA: "",
      attributeB: "",
      hasConstant: 1.25,
      considerPerviousValue: true,
    },
  ],
};

// Shirt Below Chest formulas
export const below_chest_ready = {
  output_attribute: "below_chest_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "shirt_below_chest",
      attributeB: "below_chest_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const shirt_front_half_below_chest = {
  output_attribute: "shirt_front_half_below_chest",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "below_chest_ready",
      attributeB: "",
      hasConstant: 1,
      considerPerviousValue: false,
    },

    {
      sortOrder: 2,
      operation: "ADD",
      attributeA: "",
      attributeB: "",
      hasConstant: 1.5,
      considerPerviousValue: true,
    },

    {
      sortOrder: 3,
      operation: "DIVIDE",
      attributeA: "",
      attributeB: "",
      hasConstant: 4,
      considerPerviousValue: true,
    },
    {
      sortOrder: 4,
      operation: "ROUND",
      attributeA: "",
      attributeB: "",
      hasConstant: 0.25,
      considerPerviousValue: true,
    },
  ],
};
export const shirt_back_below_chest = {
  output_attribute: "shirt_back_below_chest",
  operations: [
    {
      sortOrder: 1,
      operation: "MULTIPLY",
      attributeA: "shirt_front_half_below_chest",
      attributeB: "",
      hasConstant: 2,
      considerPerviousValue: false,
    },
    {
      sortOrder: 2,
      operation: "SUB",
      attributeA: "",
      attributeB: "below_chest_ready",
      hasConstant: 0,
      considerPerviousValue: true,
    },
    {
      sortOrder: 3,
      operation: "ADD",
      attributeA: "",
      attributeB: "",
      hasConstant: 1.25,
      considerPerviousValue: true,
    },
  ],
};

// Shirt waist formulas
export const shirtFrontHalfWaist = {
  output_attribute: "shirt_front_half_waist",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "shirt_waist_ready",
      attributeB: "",
      hasConstant: 1,
      considerPerviousValue: false,
    },
    {
      sortOrder: 2,
      operation: "ADD",
      attributeA: "",
      attributeB: "",
      hasConstant: 1.5,
      considerPerviousValue: true,
    },
    {
      sortOrder: 3,
      operation: "DIVIDE",
      attributeA: "",
      attributeB: "",
      hasConstant: 4,
      considerPerviousValue: true,
    },
    {
      sortOrder: 4,
      operation: "ROUND",
      attributeA: "",
      attributeB: "",
      hasConstant: 0.25,
      considerPerviousValue: true,
    },
  ],
  canBeEdited: true,
};
export const shirtBackWaist = {
  output_attribute: "shirt_back_waist",
  operations: [
    {
      sortOrder: 1,
      operation: "MULTIPLY",
      attributeA: "shirt_front_half_waist",
      attributeB: "",
      hasConstant: 2,
      considerPerviousValue: false,
    },
    {
      sortOrder: 2,
      operation: "SUB",
      attributeA: "",
      attributeB: "shirt_waist_ready",
      hasConstant: 0,
      considerPerviousValue: true,
    },
    {
      sortOrder: 3,
      operation: "ADD",
      attributeA: "",
      attributeB: "",
      hasConstant: 1.25,
      considerPerviousValue: true,
    },
  ],
  canBeEdited: true,
};
export const shirtWaistReady = {
  output_attribute: "shirt_waist_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "shirt_waist_body",
      attributeB: "shirt_waist_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const shirtFrontHalfSeat = {
  output_attribute: "shirt_front_half_seat",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "shirt_seat_ready",
      attributeB: "",
      hasConstant: 0,
      considerPerviousValue: false,
    },
    {
      sortOrder: 2,
      operation: "ADD",
      attributeA: "",
      attributeB: "",
      hasConstant: 1,
      considerPerviousValue: true,
    },
    {
      sortOrder: 3,
      operation: "ADD",
      attributeA: "",
      attributeB: "",
      hasConstant: 1.5,
      considerPerviousValue: true,
    },
    {
      sortOrder: 4,
      operation: "DIVIDE",
      attributeA: "",
      attributeB: "",
      hasConstant: 4,
      considerPerviousValue: true,
    },
    {
      sortOrder: 4,
      operation: "ROUND",
      attributeA: "",
      attributeB: "",
      hasConstant: 0.25,
      considerPerviousValue: true,
    },
  ],
  canBeEdited: true,
};
export const shirtBackSeat = {
  output_attribute: "shirt_back_seat",
  operations: [
    {
      sortOrder: 1,
      operation: "MULTIPLY",
      attributeA: "shirt_front_half_seat",
      attributeB: "",
      hasConstant: 2,
      considerPerviousValue: false,
    },
    {
      sortOrder: 2,
      operation: "SUB",
      attributeA: "",
      attributeB: "shirt_seat_ready",
      hasConstant: 0,
      considerPerviousValue: true,
    },
    {
      sortOrder: 3,
      operation: "ADD",
      attributeA: "",
      attributeB: "",
      hasConstant: 1.25,
      considerPerviousValue: true,
    },
  ],
  canBeEdited: true,
};
export const shirtSeatReady = {
  output_attribute: "shirt_seat_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "shirt_seat_body",
      attributeB: "shirt_seat_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const shirtBicepsReady = {
  output_attribute: "shirt_biceps_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "shirt_biceps_tight",
      attributeB: "shirt_biceps_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const shirtElbowReady = {
  output_attribute: "shirt_elbow_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "shirt_elbow_tight",
      attributeB: "shirt_elbow_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const shirtBelowChestReady = {
  output_attribute: "below_chest_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "shirt_below_chest",
      attributeB: "below_chest_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const shirtForearmReady = {
  output_attribute: "forearm_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "forearm_body",
      attributeB: "forearm_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const blazerForearmReady = {
  output_attribute: "blazer_forearm_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "blazer_forearm_body",
      attributeB: "blazer_forearm_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const blazerBelowChestReady = {
  output_attribute: "blazer_below_chest_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "blazer_below_chest",
      attributeB: "blazer_below_chest_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const jodhpuriBelowChestReady = {
  output_attribute: "jodhpuri_below_chest_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "jodhpuri_below_chest",
      attributeB: "jodhpuri_below_chest_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const jodhpuriForearmReady = {
  output_attribute: "jodhpuri_forearm_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "jodhpuri_forearm_body",
      attributeB: "jodhpuri_forearm_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const sherwani_below_chest_ready = {
  output_attribute: "sherwani_below_chest_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "sherwani_below_chest",
      attributeB: "sherwani_below_chest_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const sherwani_forearm_ready = {
  output_attribute: "sherwani_forearm_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "sherwani_forearm_body",
      attributeB: "sherwani_forearm_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const indowestern_forearm_ready = {
  output_attribute: "indowestern_forearm_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "indowestern_forearm_body",
      attributeB: "indowestern_forearm_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const indowestern_below_chest_ready = {
  output_attribute: "indowestern_below_chest_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "indowestern_below_chest",
      attributeB: "indowestern_below_chest_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const kurta_forearm_ready = {
  output_attribute: "kurta_forearm_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "kurta_forearm_body",
      attributeB: "kurta_forearm_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const kurta_below_chest_ready = {
  output_attribute: "kurta_below_chest_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "kurta_below_chest",
      attributeB: "kurta_below_chest_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const kurta_front_below_chest = {
  output_attribute: "kurta_front_below_chest",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "kurta_below_chest_ready",
      attributeB: "",
      hasConstant: 0,
      considerPerviousValue: false,
    },
    {
      sortOrder: 2,
      operation: "DIVIDE",
      attributeA: "",
      attributeB: "",
      hasConstant: 2,
      considerPerviousValue: true,
    },
  ],
  canBeEdited: true,
};

export const kurta_back_below_chest = {
  output_attribute: "kurta_back_below_chest",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "kurta_below_chest_ready",
      attributeB: "",
      hasConstant: 0,
      considerPerviousValue: false,
    },
    {
      sortOrder: 2,
      operation: "SUB",
      attributeA: "",
      attributeB: "kurta_front_below_chest",
      hasConstant: 0,
      considerPerviousValue: true,
    },
  ],
  canBeEdited: true,
};

export const waistcoat_below_chest_ready = {
  output_attribute: "waistcoat_below_chest_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "waistcoat_below_chest",
      attributeB: "waistcoat_below_chest_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const sadri_below_chest_ready = {
  output_attribute: "sadri_below_chest_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "sadri_below_chest",
      attributeB: "sadri_below_chest_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const suit_forearm_ready = {
  output_attribute: "suit_forearm_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "suit_forearm_body",
      attributeB: "suit_forearm_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const suit_below_chest_ready = {
  output_attribute: "suit_below_chest_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "suit_below_chest",
      attributeB: "suit_below_chest_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const trouser_back_tummy_to_back = {
  output_attribute: "trouser_back_tummy_to_back",
  operations: [
    {
      sortOrder: 1,
      operation: "SUB",
      attributeA: "trouser_tummy_to_back",
      attributeB: "trouser_front_to_back",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const gurka_pant_back_tummy_to_back = {
  output_attribute: "gurka_pant_back_tummy_to_back",
  operations: [
    {
      sortOrder: 1,
      operation: "SUB",
      attributeA: "gurka_pant_tummy_to_back",
      attributeB: "gurka_pant_front_to_back",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const chudidar_back_tummy_to_back = {
  output_attribute: "chudidar_back_tummy_to_back",
  operations: [
    {
      sortOrder: 1,
      operation: "SUB",
      attributeA: "chudidar_tummy_to_back",
      attributeB: "chudidar_front_to_back",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const poonapant_back_tummy_to_back = {
  output_attribute: "poonapant_back_tummy_to_back",
  operations: [
    {
      sortOrder: 1,
      operation: "SUB",
      attributeA: "poonapant_front_to_back",
      attributeB: "poonapant_tummy_to_back",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const chinos_back_tummy_to_back = {
  output_attribute: "chinos_back_tummy_to_back",
  operations: [
    {
      sortOrder: 1,
      operation: "SUB",
      attributeA: "chinos_front_to_back",
      attributeB: "chinos_tummy_to_back",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const suit_trouser_back_tummy_to_back = {
  output_attribute: "suit_trouser_back_tummy_to_back",
  operations: [
    {
      sortOrder: 1,
      operation: "SUB",
      attributeA: "suit_trouser_front_to_back",
      attributeB: "suit_trouser_tummy_to_back",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

// Trouser Formulas

export const trouserKneeLoose = {
  output_attribute: "trouser_knee_loose",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "trouser_knee_tight",
      attributeB: "trouser_knee_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const trouserThighLoose = {
  output_attribute: "trouser_thigh_loose",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "trouser_thigh_tight",
      attributeB: "trouser_thigh_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const trouserCalfLoose = {
  output_attribute: "trouser_calf_loose",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "trouser_calf_tight",
      attributeB: "trouser_calf_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

// Gurka Pant Formulas
export const gurkapantCalfLoose = {
  output_attribute: "gurka_pant_calf_loose",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "gurka_pant_calf_tight",
      attributeB: "gurka_pant_calf_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const gurkapantKneeLoose = {
  output_attribute: "gurka_pant_knee_loose",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "gurka_pant_knee_tight",
      attributeB: "gurka_pant_knee_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const gurkapantThighLoose = {
  output_attribute: "gurka_pant_thigh_loose",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "gurka_pant_thigh_tight",
      attributeB: "gurka_pant_thigh_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};


// Blazer Formulas
export const blazerChestReady = {
  output_attribute: "blazer_chest_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "blazer_chest",
      attributeB: "blazer_chest_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const blazerWaistReady = {
  output_attribute: "blazer_waist_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "blazer_waist",
      attributeB: "blazer_waist_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const blazerSeatReady = {
  output_attribute: "blazer_seat_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "blazer_seat",
      attributeB: "blazer_seat_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const blazerBicepsLoose = {
  output_attribute: "blazer_biceps_loose",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "blazer_biceps_tight",
      attributeB: "blazer_biceps_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const blazerElbowLoose = {
  output_attribute: "blazer_elbow_loose",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "blazer_elbow_tight",
      attributeB: "blazer_elbow_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const waistcoatChestReady = {
  output_attribute: "waistcoat_chest_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "waistcoat_chest_body",
      attributeB: "waistcoat_chest_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const waistcoat_waist_ready = {
  output_attribute: "waistcoat_waist_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "waistcoat_waist_body",
      attributeB: "waistcoat_waist_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const waistcoat_seat_ready = {
  output_attribute: "waistcoat_seat_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "waistcoat_seat_body",
      attributeB: "waistcoat_seat_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const waistcoat_length_for_double_breasted = {
  output_attribute: "waistcoat_length_for_double_breasted",
  operations: [
    {
      sortOrder: 1,
      operation: "SUB",
      attributeA: "waistcoat_overall_pointed_length",
      attributeB: "",
      hasConstant: 1,
      considerPerviousValue: false,
    },
  ],
};

export const waistcoat_belt_length = {
  output_attribute: "waistcoat_belt_length",
  operations: [
    {
      sortOrder: 1,
      operation: "SUB",
      attributeA: "waistcoat_overall_pointed_length",
      attributeB: "",
      hasConstant: 1.5,
      considerPerviousValue: false,
    },
  ],
};

export const chinos_knee_loose = {
  output_attribute: "chinos_knee_loose",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "chinos_knee",
      attributeB: "chinos_knee_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const chinos_thigh_loose = {
  output_attribute: "chinos_thigh_loose",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "chinos_thigh",
      attributeB: "chinos_thigh_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const chinos_calf_loose = {
  output_attribute: "chinos_calf_loose",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "chinos_calf_tight",
      attributeB: "chinos_calf_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const indowestern_neck_ready = {
  output_attribute: "indowestern_neck_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "indowestern_neck_body",
      attributeB: "",
      hasConstant: 1.5,
      considerPerviousValue: false,
    },
  ],
};
export const indowestern_chest_ready = {
  output_attribute: "indowestern_chest_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "indowestern_chest_body",
      attributeB: "indowestern_chest_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const indowestern_waist_ready = {
  output_attribute: "indowestern_waist_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "indowestern_waist_body",
      attributeB: "indowestern_waist_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const indowestern_seat_ready = {
  output_attribute: "indowestern_seat_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "indowestern_seat_body",
      attributeB: "indowestern_seat_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const indowestern_biceps_loose = {
  output_attribute: "indowestern_biceps_loose",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "indowestern_biceps_tight",
      attributeB: "indowestern_biceps_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const indowestern_elbow_loose = {
  output_attribute: "indowestern_elbow_loose",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "indowestern_elbow_tight",
      attributeB: "indowestern_elbow_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const kurta_ready_neck = {
  output_attribute: "kurta_ready_neck",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "kurta_body_neck",
      attributeB: "",
      hasConstant: 1.5,
      considerPerviousValue: false,
    },
  ],
};
export const kurta_front_half_chest = {
  output_attribute: "kurta_front_half_chest",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "kurta_chest_ready",
      attributeB: "",
      hasConstant: 0,
      considerPerviousValue: false,
    },
    {
      sortOrder: 2,
      operation: "DIVIDE",
      attributeA: "",
      attributeB: "",
      hasConstant: 2,
      considerPerviousValue: true,
    },
  ],
  canBeEdited: true,
};
export const kurta_back_chest = {
  output_attribute: "kurta_back_chest",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "kurta_chest_ready",
      attributeB: "",
      hasConstant: 0,
      considerPerviousValue: false,
    },
    {
      sortOrder: 2,
      operation: "SUB",
      attributeA: "",
      attributeB: "kurta_front_half_chest",
      hasConstant: 0,
      considerPerviousValue: true,
    },
  ],
  canBeEdited: true,
};
export const kurta_chest_ready = {
  output_attribute: "kurta_chest_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "kurta_chest_body",
      attributeB: "kurta_chest_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const kurta_front_half_waist = {
  output_attribute: "kurta_front_half_waist",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "kurta_waist_ready",
      attributeB: "",
      hasConstant: 0,
      considerPerviousValue: false,
    },
    {
      sortOrder: 2,
      operation: "DIVIDE",
      attributeA: "",
      attributeB: "",
      hasConstant: 2,
      considerPerviousValue: true,
    },
  ],
  canBeEdited: true,
};
export const kurta_back_waist = {
  output_attribute: "kurta_back_waist",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "kurta_waist_ready",
      attributeB: "",
      hasConstant: 0,
      considerPerviousValue: false,
    },
    {
      sortOrder: 2,
      operation: "SUB",
      attributeA: "",
      attributeB: "kurta_front_half_waist",
      hasConstant: 0,
      considerPerviousValue: true,
    },
  ],
  canBeEdited: true,
};
export const kurta_waist_ready = {
  output_attribute: "kurta_waist_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "kurta_waist_body",
      attributeB: "kurta_waist_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const kurta_front_half_seat = {
  output_attribute: "kurta_front_half_seat",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "kurta_seat_ready",
      attributeB: "",
      hasConstant: 0,
      considerPerviousValue: false,
    },
    {
      sortOrder: 2,
      operation: "DIVIDE",
      attributeA: "",
      attributeB: "",
      hasConstant: 2,
      considerPerviousValue: true,
    },
  ],
  canBeEdited: true,
};
export const kurta_back_seat = {
  output_attribute: "kurta_back_seat",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "kurta_seat_ready",
      attributeB: "",
      hasConstant: 0,
      considerPerviousValue: false,
    },
    {
      sortOrder: 2,
      operation: "SUB",
      attributeA: "",
      attributeB: "kurta_front_half_seat",
      hasConstant: 0,
      considerPerviousValue: true,
    },
  ],
  canBeEdited: true,
};
export const kurta_seat_ready = {
  output_attribute: "kurta_seat_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "kurta_seat_body",
      attributeB: "kurta_seat_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const kurta_biceps_ready = {
  output_attribute: "kurta_biceps_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "kurta_biceps_tight",
      attributeB: "kurta_biceps_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const kurta_elbow_loose = {
  output_attribute: "kurta_elbow_loose",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "kurta_elbow_tight",
      attributeB: "kurta_elbow_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const jodhpuri_neck_ready = {
  output_attribute: "jodhpuri_neck_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "jodhpuri_neck_body",
      attributeB: "",
      hasConstant: 1.5,
      considerPerviousValue: false,
    },
  ],
};
export const jodhpuri_chest_ready = {
  output_attribute: "jodhpuri_chest_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "jodhpuri_chest",
      attributeB: "jodhpuri_chest_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const jodhpuri_waist_ready = {
  output_attribute: "jodhpuri_waist_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "jodhpuri_waist",
      attributeB: "jodhpuri_waist_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const jodhpuri_seat_ready = {
  output_attribute: "jodhpuri_seat_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "jodhpuri_seat",
      attributeB: "jodhpuri_seat_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const jodhpuri_elbow_loose = {
  output_attribute: "jodhpuri_elbow_loose",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "jodhpuri_elbow_tight",
      attributeB: "jodhpuri_elbow_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const jodhpuri_biceps_loose = {
  output_attribute: "jodhpuri_biceps_loose",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "jodhpuri_biceps_tight",
      attributeB: "jodhpuri_biceps_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const sherwani_neck_ready = {
  output_attribute: "sherwani_neck_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "sherwani_neck_body",
      attributeB: "",
      hasConstant: 1.5,
      considerPerviousValue: false,
    },
  ],
};
export const sherwani_chest_ready = {
  output_attribute: "sherwani_chest_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "sherwani_chest_body",
      attributeB: "sherwani_chest_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const sherwani_waist_ready = {
  output_attribute: "sherwani_waist_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "sherwani_waist_body",
      attributeB: "sherwani_waist_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const sherwani_seat_ready = {
  output_attribute: "sherwani_seat_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "sherwani_seat_body",
      attributeB: "sherwani_seat_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const sherwani_elbow_loose = {
  output_attribute: "sherwani_elbow_loose",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "sherwani_elbow_loosening",
      attributeB: "sherwani_elbow_tight",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const sherwani_biceps_loose = {
  output_attribute: "sherwani_biceps_loose",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "sherwani_biceps_loosening",
      attributeB: "sherwani_biceps_tight",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const sadri_neck_ready = {
  output_attribute: "sadri_neck_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "sadri_neck_body",
      attributeB: "",
      hasConstant: 1.5,
      considerPerviousValue: false,
    },
  ],
};
export const sadri_chest_ready = {
  output_attribute: "sadri_chest_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "sadri_chest",
      attributeB: "sadri_chest_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const sadri_waist_ready = {
  output_attribute: "sadri_waist_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "sadri_waist_body",
      attributeB: "sadri_waist_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const sadri_seat_ready = {
  output_attribute: "sadri_seat_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "sadri_seat_body",
      attributeB: "sadri_seat_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const poonapant_knee_loose = {
  output_attribute: "poonapant_knee_loose",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "poonapant_knee_tight",
      attributeB: "poonapant_knee_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const poonapant_thigh_loose = {
  output_attribute: "poonapant_thigh_loose",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "poonapant_thigh_tight",
      attributeB: "poonapant_thigh_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};
export const poonapant_calf_loose = {
  output_attribute: "poonapant_calf_loose",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "poonapant_calf_tight",
      attributeB: "poonapant_calf_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const suit_chest_ready = {
  output_attribute: "suit_chest_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "suit_chest",
      attributeB: "suit_chest_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const suit_waist_ready = {
  output_attribute: "suit_waist_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "suit_waist",
      attributeB: "suit_waist_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const suit_seat_ready = {
  output_attribute: "suit_seat_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "suit_seat",
      attributeB: "suit_seat_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const suit_biceps_loose = {
  output_attribute: "suit_biceps_loose",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "suit_biceps_tight",
      attributeB: "suit_biceps_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const suit_elbow_loose = {
  output_attribute: "suit_elbow_loose",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "suit_elbow_tight",
      attributeB: "suit_elbow_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const suit_trouser_knee_loose = {
  output_attribute: "suit_trouser_knee_loose",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "suit_trouser_knee_tight",
      attributeB: "suit_trouser_knee_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const suit_trouser_thigh_loose = {
  output_attribute: "suit_trouser_thigh_loose",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "suit_trouser_thigh_tight",
      attributeB: "suit_trouser_thigh_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const suit_trouser_calf_loose = {
  output_attribute: "suit_trouser_calf_loose",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "suit_trouser_calf_tight",
      attributeB: "suit_trouser_calf_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const dhoti_ready_length = {
  output_attribute: "ready_dhoti_length",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "dhoti_length",
      attributeB: "",
      hasConstant: 2,
      considerPerviousValue: false,
    },
  ],
};

export const patyala_ready_length = {
  output_attribute: "ready_patyala_length",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "patyala_dhoti_length",
      attributeB: "",
      hasConstant: 2,
      considerPerviousValue: false,
    },
  ],
};

export const armhole_ready = {
  output_attribute: "armhole_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "armhole_body",
      attributeB: "armhole_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const blazer_armhole_ready = {
  output_attribute: "blazer_armhole_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "blazer_armhole_body",
      attributeB: "blazer_armhole_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const indowestern_armhole_ready = {
  output_attribute: "indowestern_armhole_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "indowestern_armhole_body",
      attributeB: "indowestern_armhole_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const kurta_armhole_ready = {
  output_attribute: "kurta_armhole_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "kurta_armhole_body",
      attributeB: "kurta_armhole_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const sherwani_armhole_ready = {
  output_attribute: "sherwani_armhole_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "sherwani_armhole_body",
      attributeB: "sherwani_armhole_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const jodhpuri_armhole_ready = {
  output_attribute: "jodhpuri_armhole_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "jodhpuri_armhole_body",
      attributeB: "jodhpuri_armhole_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const suit_armhole_ready = {
  output_attribute: "suit_armhole_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "suit_armhole_body",
      attributeB: "suit_armhole_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

// Kurta Shirt Formulas
export const outKurtaShirtLengthFormula = {
  output_attribute: "out_kurta_shirt_length",
  operations: [
    {
      sortOrder: 1,
      operation: "SUB",
      attributeA: "in_kurta_shirt_length",
      attributeB: null,
      hasConstant: 0.5,
      considerPerviousValue: false,
    },
  ],
};

export const kurtaShirtChestReadyFormula = {
  output_attribute: "kurta_shirt_chest_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "kurta_shirt_chest_body",
      attributeB: "kurta_shirt_chest_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const kurtaShirtFromHalfChestFormula = {
  output_attribute: "kurta_shirt_front_half_chest",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "kurta_shirt_chest_ready",
      attributeB: "",
      hasConstant: 1,
      considerPerviousValue: false,
    },
    {
      sortOrder: 2,
      operation: "ADD",
      attributeA: "",
      attributeB: "",
      hasConstant: 1.5,
      considerPerviousValue: true,
    },
    {
      sortOrder: 3,
      operation: "DIVIDE",
      attributeA: "",
      attributeB: "",
      hasConstant: 4,
      considerPerviousValue: true,
    },
    {
      sortOrder: 4,
      operation: "ROUND",
      attributeA: "",
      attributeB: "",
      hasConstant: 0.25,
      considerPerviousValue: true,
    },
  ],
};

export const kurtaShirtBackChestFormula = {
  output_attribute: "kurta_shirt_back_chest",
  operations: [
    {
      sortOrder: 1,
      operation: "MULTIPLY",
      attributeA: "kurta_shirt_front_half_chest",
      attributeB: "",
      hasConstant: 2,
      considerPerviousValue: false,
    },
    {
      sortOrder: 2,
      operation: "SUB",
      attributeA: "",
      attributeB: "kurta_shirt_chest_ready",
      hasConstant: 0,
      considerPerviousValue: true,
    },
    {
      sortOrder: 3,
      operation: "ADD",
      attributeA: "",
      attributeB: "",
      hasConstant: 1.25,
      considerPerviousValue: true,
    },
  ],
};

export const kurtaShirtBelowChestReady = {
  output_attribute: "kurta_shirt_below_chest_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "kurta_shirt_below_chest_body",
      attributeB: "kurta_shirt_below_chest_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const kurtaShirtFrontHalfBelowChest = {
  output_attribute: "kurta_shirt_front_half_below_chest",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "kurta_shirt_below_chest_ready",
      attributeB: "",
      hasConstant: 1,
      considerPerviousValue: false,
    },
    {
      sortOrder: 2,
      operation: "ADD",
      attributeA: "",
      attributeB: "",
      hasConstant: 1.5,
      considerPerviousValue: true,
    },
    {
      sortOrder: 3,
      operation: "DIVIDE",
      attributeA: "",
      attributeB: "",
      hasConstant: 4,
      considerPerviousValue: true,
    },
    {
      sortOrder: 4,
      operation: "ROUND",
      attributeA: "",
      attributeB: "",
      hasConstant: 0.25,
      considerPerviousValue: true,
    },
  ],
};

export const kurtaShirtBackBelowChest = {
  output_attribute: "kurta_shirt_back_below_chest",
  operations: [
    {
      sortOrder: 1,
      operation: "MULTIPLY",
      attributeA: "kurta_shirt_front_half_below_chest",
      attributeB: "",
      hasConstant: 2,
      considerPerviousValue: false,
    },
    {
      sortOrder: 2,
      operation: "SUB",
      attributeA: "",
      attributeB: "kurta_shirt_below_chest_ready",
      hasConstant: 0,
      considerPerviousValue: true,
    },
    {
      sortOrder: 3,
      operation: "ADD",
      attributeA: "",
      attributeB: "",
      hasConstant: 1.25,
      considerPerviousValue: true,
    },
  ],
};

export const kurtaShirtWaistReady = {
  output_attribute: "kurta_shirt_waist_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "kurta_shirt_waist_body",
      attributeB: "kurta_shirt_waist_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const kurtaShirtFrontHalfWaist = {
  output_attribute: "kurta_shirt_front_half_waist",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "kurta_shirt_waist_ready",
      attributeB: "",
      hasConstant: 1,
      considerPerviousValue: false,
    },
    {
      sortOrder: 2,
      operation: "ADD",
      attributeA: "",
      attributeB: "",
      hasConstant: 1.5,
      considerPerviousValue: true,
    },
    {
      sortOrder: 3,
      operation: "DIVIDE",
      attributeA: "",
      attributeB: "",
      hasConstant: 4,
      considerPerviousValue: true,
    },
    {
      sortOrder: 4,
      operation: "ROUND",
      attributeA: "",
      attributeB: "",
      hasConstant: 0.25,
      considerPerviousValue: true,
    },
  ],
  canBeEdited: true,
};

export const kurtaShirtBackWaist = {
  output_attribute: "kurta_shirt_back_waist",
  operations: [
    {
      sortOrder: 1,
      operation: "MULTIPLY",
      attributeA: "kurta_shirt_front_half_waist",
      attributeB: "",
      hasConstant: 2,
      considerPerviousValue: false,
    },
    {
      sortOrder: 2,
      operation: "SUB",
      attributeA: "",
      attributeB: "kurta_shirt_waist_ready",
      hasConstant: 0,
      considerPerviousValue: true,
    },
    {
      sortOrder: 3,
      operation: "ADD",
      attributeA: "",
      attributeB: "",
      hasConstant: 1.25,
      considerPerviousValue: true,
    },
  ],
  canBeEdited: true,
};

export const kurtaShirtSeatReady = {
  output_attribute: "kurta_shirt_seat_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "kurta_shirt_seat_body",
      attributeB: "kurta_shirt_seat_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const kurtaShirtFrontHalfSeat = {
  output_attribute: "kurta_shirt_front_half_seat",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "kurta_shirt_seat_ready",
      attributeB: "",
      hasConstant: 0,
      considerPerviousValue: false,
    },
    {
      sortOrder: 2,
      operation: "ADD",
      attributeA: "",
      attributeB: "",
      hasConstant: 1,
      considerPerviousValue: true,
    },
    {
      sortOrder: 3,
      operation: "ADD",
      attributeA: "",
      attributeB: "",
      hasConstant: 1.5,
      considerPerviousValue: true,
    },
    {
      sortOrder: 4,
      operation: "DIVIDE",
      attributeA: "",
      attributeB: "",
      hasConstant: 4,
      considerPerviousValue: true,
    },
    {
      sortOrder: 5,
      operation: "ROUND",
      attributeA: "",
      attributeB: "",
      hasConstant: 0.25,
      considerPerviousValue: true,
    },
  ],
  canBeEdited: true,
};

export const kurtaShirtBackSeat = {
  output_attribute: "kurta_shirt_back_seat",
  operations: [
    {
      sortOrder: 1,
      operation: "MULTIPLY",
      attributeA: "kurta_shirt_front_half_seat",
      attributeB: "",
      hasConstant: 2,
      considerPerviousValue: false,
    },
    {
      sortOrder: 2,
      operation: "SUB",
      attributeA: "",
      attributeB: "kurta_shirt_seat_ready",
      hasConstant: 0,
      considerPerviousValue: true,
    },
    {
      sortOrder: 3,
      operation: "ADD",
      attributeA: "",
      attributeB: "",
      hasConstant: 1.25,
      considerPerviousValue: true,
    },
  ],
  canBeEdited: true,
};

export const kurtaShirtBicepsReady = {
  output_attribute: "kurta_shirt_biceps_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "kurta_shirt_biceps_body",
      attributeB: "kurta_shirt_biceps_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const kurtaShirtElbowReady = {
  output_attribute: "kurta_shirt_elbow_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "kurta_shirt_elbow_body",
      attributeB: "kurta_shirt_elbow_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const kurtaShirtForearmReady = {
  output_attribute: "kurta_shirt_forearm_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "kurta_shirt_forearm_body",
      attributeB: "kurta_shirt_forearm_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

export const kurtaShirtArmholeReady = {
  output_attribute: "kurta_shirt_armhole_ready",
  operations: [
    {
      sortOrder: 1,
      operation: "ADD",
      attributeA: "kurta_shirt_armhole_body",
      attributeB: "kurta_shirt_armhole_loosening",
      hasConstant: 0,
      considerPerviousValue: false,
    },
  ],
};

