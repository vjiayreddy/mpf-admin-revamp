export const calCommonMeasurements = [
  {
    // Shirt
    catId: "5da7220571762c2a58b27a65",
    inputs: [
      {
        name: "shirt_shoulder",
        outputs: [
          {
            name: "blazer_shoulder",
            operation: "SUB",
            value: 0.5,
          },
          {
            name: "suit_shoulder",
            operation: "SUB",
            value: 0.5,
          },
          {
            name: "jodhpuri_shoulder",
            operation: "SUB",
            value: 0.5,
          },
          {
            name: "kurta_shoulder",
            operation: "ADD",
            value: 0,
          },
          {
            name: "sherwani_shoulder",
            operation: "SUB",
            value: 0.5,
          },
          {
            name: "indowestern_shoulder",
            operation: "SUB",
            value: 0.5,
          },
          {
            name: "waistcoat_shoulder",
            operation: "SUB",
            value: 1.75,
          },
        ],
      },
      {
        name: "shirt_neck",
        outputs: [
          {
            name: "blazer_neck",
            operation: "ADD",
            value: 0,
          },
          {
            name: "suit_neck",
            operation: "ADD",
            value: 0,
          },
          {
            name: "jodhpuri_neck_body",
            operation: "ADD",
            value: 0,
          },
          {
            name: "kurta_body_neck",
            operation: "ADD",
            value: 0,
          },
          {
            name: "sherwani_neck_body",
            operation: "ADD",
            value: 0,
          },
          {
            name: "indowestern_neck_body",
            operation: "ADD",
            value: 0,
          },
          {
            name: "waistcoat_neck",
            operation: "ADD",
            value: 0,
          },
          {
            name: "sadri_neck_body",
            operation: "ADD",
            value: 0,
          },
        ],
      },
      {
        name: "shirt_chest_body",
        outputs: [
          {
            name: "blazer_chest",
            operation: "ADD",
            value: 0,
          },
          {
            name: "suit_chest",
            operation: "ADD",
            value: 0,
          },
          {
            name: "jodhpuri_chest",
            operation: "ADD",
            value: 0,
          },
          {
            name: "kurta_chest_body",
            operation: "ADD",
            value: 0,
          },
          {
            name: "sherwani_chest_body",
            operation: "ADD",
            value: 0,
          },
          {
            name: "indowestern_chest_body",
            operation: "ADD",
            value: 0,
          },
          {
            name: "waistcoat_chest_body",
            operation: "ADD",
            value: 0,
          },
          {
            name: "sadri_chest",
            operation: "SUB",
            value: 0,
          },
        ],
      },
      {
        name: "shirt_below_chest",
        outputs: [
          {
            name: "blazer_below_chest",
            operation: "ADD",
            value: 0,
          },
          {
            name: "suit_below_chest",
            operation: "ADD",
            value: 0,
          },
          {
            name: "jodhpuri_below_chest",
            operation: "ADD",
            value: 0,
          },
          {
            name: "kurta_below_chest",
            operation: "ADD",
            value: 0,
          },
          {
            name: "sherwani_below_chest",
            operation: "ADD",
            value: 0,
          },
          {
            name: "indowestern_below_chest",
            operation: "ADD",
            value: 0,
          },
          {
            name: "waistcoat_below_chest",
            operation: "ADD",
            value: 0,
          },
          {
            name: "sadri_below_chest",
            operation: "ADD",
            value: 0,
          },
        ],
      },
      {
        name: "shirt_waist_body",
        outputs: [
          {
            name: "blazer_waist",
            operation: "ADD",
            value: 0,
          },
          {
            name: "suit_waist",
            operation: "ADD",
            value: 0,
          },
          {
            name: "jodhpuri_waist",
            operation: "ADD",
            value: 0,
          },
          {
            name: "kurta_waist_body",
            operation: "ADD",
            value: 0,
          },
          {
            name: "sherwani_waist_body",
            operation: "ADD",
            value: 0,
          },
          {
            name: "indowestern_waist_body",
            operation: "ADD",
            value: 0,
          },
          {
            name: "waistcoat_waist_body",
            operation: "ADD",
            value: 0,
          },
          {
            name: "sadri_waist_body",
            operation: "ADD",
            value: 0,
          },
        ],
      },
      {
        name: "shirt_seat_body",
        outputs: [
          {
            name: "blazer_seat",
            operation: "ADD",
            value: 0,
          },
          {
            name: "suit_seat",
            operation: "ADD",
            value: 0,
          },
          {
            name: "jodhpuri_seat",
            operation: "ADD",
            value: 0,
          },
          {
            name: "kurta_seat_body",
            operation: "ADD",
            value: 0,
          },
          {
            name: "sherwani_seat_body",
            operation: "ADD",
            value: 0,
          },
          {
            name: "indowestern_seat_body",
            operation: "ADD",
            value: 0,
          },
          {
            name: "sadri_seat_body",
            operation: "ADD",
            value: 0,
          },
        ],
      },
      {
        name: "shirt_sleeve_length",
        outputs: [
          {
            name: "blazer_sleeve_length",
            operation: "ADD",
            value: 0,
          },
          {
            name: "suit_sleeve_length",
            operation: "ADD",
            value: 0,
          },
          {
            name: "jodhpuri_sleeve_length",
            operation: "ADD",
            value: 0,
          },
          {
            name: "kurta_sleeve_length",
            operation: "SUB",
            value: 0,
          },
          {
            name: "sherwani_sleeve_length",
            operation: "SUB",
            value: 0.5,
          },
          {
            name: "indowestern_sleeve_length",
            operation: "SUB",
            value: 0.5,
          },
        ],
      },
      {
        name: "shirt_biceps_tight",
        outputs: [
          {
            name: "blazer_biceps_tight",
            operation: "ADD",
            value: 0,
          },
          {
            name: "suit_biceps_tight",
            operation: "ADD",
            value: 0,
          },
          {
            name: "jodhpuri_biceps_tight",
            operation: "ADD",
            value: 0,
          },
          {
            name: "kurta_biceps_tight",
            operation: "ADD",
            value: 0,
          },
          {
            name: "sherwani_biceps_tight",
            operation: "ADD",
            value: 0,
          },
          {
            name: "indowestern_biceps_tight",
            operation: "ADD",
            value: 0,
          },
        ],
      },
      {
        name: "shirt_elbow_tight",
        outputs: [
          {
            name: "blazer_elbow_tight",
            operation: "ADD",
            value: 0,
          },
          {
            name: "suit_elbow_tight",
            operation: "ADD",
            value: 0,
          },
          {
            name: "jodhpuri_elbow_tight",
            operation: "ADD",
            value: 0,
          },
          {
            name: "kurta_elbow_tight",
            operation: "ADD",
            value: 0,
          },
          {
            name: "sherwani_elbow_tight",
            operation: "ADD",
            value: 0,
          },
          {
            name: "indowestern_elbow_tight",
            operation: "ADD",
            value: 0,
          },
        ],
      },
      {
        name: "shirt_cross_back",
        outputs: [
          {
            name: "blazer_cross_back",
            operation: "ADD",
            value: 0,
          },
          {
            name: "suit_cross_back",
            operation: "ADD",
            value: 0,
          },
          {
            name: "jodhpuri_cross_back",
            operation: "ADD",
            value: 0,
          },
          {
            name: "sherwani_cross_back",
            operation: "ADD",
            value: 0,
          },
          {
            name: "indowestern_cross_back",
            operation: "ADD",
            value: 0,
          },
          {
            name: "waistcoat_cross_back",
            operation: "ADD",
            value: 0,
          },
        ],
      },
      {
        name: "forearm_body",
        outputs: [
          {
            name: "blazer_forearm_body",
            operation: "ADD",
            value: 0,
          },
          {
            name: "suit_forearm_body",
            operation: "ADD",
            value: 0,
          },
          {
            name: "jodhpuri_forearm_body",
            operation: "ADD",
            value: 0,
          },
          {
            name: "kurta_forearm_body",
            operation: "ADD",
            value: 0,
          },
          {
            name: "sherwani_forearm_body",
            operation: "ADD",
            value: 0,
          },
          {
            name: "indowestern_forearm_body",
            operation: "ADD",
            value: 0,
          },
        ],
      },

      {
        name: "armhole_body",
        outputs: [
          {
            name: "blazer_armhole_body",
            operation: "ADD",
            value: 0,
          },
          {
            name: "suit_armhole_body",
            operation: "ADD",
            value: 0,
          },
          {
            name: "jodhpuri_armhole_body",
            operation: "ADD",
            value: 0,
          },
          {
            name: "kurta_armhole_body",
            operation: "ADD",
            value: 0,
          },
          {
            name: "sherwani_armhole_body",
            operation: "ADD",
            value: 0,
          },
          {
            name: "indowestern_armhole_body",
            operation: "ADD",
            value: 0,
          },
        ],
      },
    ],
  },
  // Trouser
  {
    catId: "5da7220571762c2a58b27a67",
    inputs: [
      {
        name: "trouser_length",
        outputs: [
          {
            name: "suit_trouser_length",
            operation: "ADD",
            value: 0,
          },
          {
            name: "chinos_length",
            operation: "ADD",
            value: 0,
          },
          {
            name: "poonapant_length",
            operation: "ADD",
            value: 0,
          },

          {
            name: "dhoti_length",
            operation: "ADD",
            value: 0,
          },
          {
            name: "gurka_pant_length",
            operation: "ADD",
            value: 0,
          },
          {
            name: "patyala_dhoti_length",
            operation: "ADD",
            value: 0,
          },
        ],
      },
      {
        name: "trouser_front_length",
        outputs: [

          {
            name: "chinos_front_length",
            operation: "ADD",
            value: 0,
          },
          {
            name: "poonapant_front_length",
            operation: "ADD",
            value: 0,
          },
          {
            name: "suit_trouser_front_length",
            operation: "ADD",
            value: 0,
          },

        ],
      },
      {
        name: "trouser_back_length",
        outputs: [

          {
            name: "chinos_back_length",
            operation: "ADD",
            value: 0,
          },
          {
            name: "poonapant_back_length",
            operation: "ADD",
            value: 0,
          },
          {
            name: "suit_trouser_back_length",
            operation: "ADD",
            value: 0,
          },


        ],
      },
      {
        name: "trouser_waist",
        outputs: [
          {
            name: "suit_trouser_waist",
            operation: "ADD",
            value: 0,
          },
          {
            name: "chinos_waist",
            operation: "ADD",
            value: 0,
          },
          {
            name: "poonapant_waist",
            operation: "ADD",
            value: 0,
          },
          {
            name: "patyala_dhoti_waist",
            operation: "ADD",
            value: 0,
          },
          {
            name: "dhoti_waist",
            operation: "ADD",
            value: 0,
          },
          {
            name: "gurka_pant_waist",
            operation: "ADD",
            value: 0,
          },
        ],
      },
      {
        name: "trouser_seat",
        outputs: [
          {
            name: "suit_trouser_seat",
            operation: "ADD",
            value: 0,
          },
          {
            name: "chinos_seat",
            operation: "ADD",
            value: 0,
          },
          {
            name: "poonapant_seat",
            operation: "ADD",
            value: 0,
          },
          {
            name: "patyala_dhoti_seat",
            operation: "ADD",
            value: 0,
          },
          {
            name: "dhoti_seat",
            operation: "ADD",
            value: 0,
          },
          {
            name: "gurka_pant_seat",
            operation: "ADD",
            value: 0,
          },
        ],
      },
      {
        name: "trouser_thigh_tight",
        outputs: [
          {
            name: "suit_trouser_thigh_tight",
            operation: "ADD",
            value: 0,
          },
          {
            name: "chinos_thigh",
            operation: "ADD",
            value: 0,
          },
          {
            name: "poonapant_thigh_tight",
            operation: "ADD",
            value: 0,
          },
          {
            name: "gurka_pant_thigh_tight",
            operation: "ADD",
            value: 0,
          },
          {
            name: "dhoti_thigh_body",
            operation: "ADD",
            value: 0,
          },
          {
            name: "patyala_thigh_body",
            operation: "ADD",
            value: 0,
          },
        ],
      },
      {
        name: "trouser_knee_tight",
        outputs: [
          {
            name: "suit_trouser_knee_tight",
            operation: "ADD",
            value: 0,
          },
          {
            name: "chinos_knee",
            operation: "ADD",
            value: 0,
          },
          {
            name: "poonapant_knee_tight",
            operation: "ADD",
            value: 0,
          },
          {
            name: "gurka_pant_knee_tight",
            operation: "ADD",
            value: 0,
          },
        ],
      },
      {
        name: "trouser_calf_tight",
        outputs: [
          {
            name: "suit_trouser_calf_tight",
            operation: "ADD",
            value: 0,
          },
          {
            name: "chinos_calf_tight",
            operation: "ADD",
            value: 0,
          },
          {
            name: "poonapant_calf_tight",
            operation: "ADD",
            value: 0,
          },
          {
            name: "gurka_pant_calf_tight",
            operation: "ADD",
            value: 0,
          },
        ],
      },
      {
        name: "trouser_leg_opening",
        outputs: [
          {
            name: "suit_trouser_leg_opening",
            operation: "ADD",
            value: 0,
          },
          {
            name: "chinos_leg_opening",
            operation: "SUB",
            value: 0.5,
          },
          {
            name: "poonapant_leg_opening",
            operation: "SUB",
            value: 0.5,
          },
          {
            name: "gurka_pant_leg_opening",
            operation: "ADD",
            value: 0,
          },
        ],
      },
      {
        name: "trouser_tummy_to_back",
        outputs: [
          {
            name: "suit_trouser_tummy_to_back",
            operation: "ADD",
            value: 0,
          },
          {
            name: "chinos_tummy_to_back",
            operation: "ADD",
            value: 0,
          },
          {
            name: "poonapant_tummy_to_back",
            operation: "ADD",
            value: 0,
          },
          {
            name: "dhoti_tummy_to_back",
            operation: "ADD",
            value: 0,
          },
          {
            name: "patyala_tummy_to_back",
            operation: "ADD",
            value: 0,
          },
          {
            name: "gurka_pant_tummy_to_back",
            operation: "ADD",
            value: 0,
          },
        ],
      },
      {
        name: "trouser_front_to_back",
        outputs: [
          {
            name: "suit_trouser_front_to_back",
            operation: "ADD",
            value: 0,
          },
        ],
      },
      {
        name: "trouser_back_tummy_to_back",
        outputs: [
          {
            name: "suit_trouser_back_tummy_to_back",
            operation: "ADD",
            value: 0,
          },
        ],
      },
    ],
  },
]
