insert into public.test_types (name, result_fields, classification_rules) values
(
  'Drug',
  '[
    {"key":"thc","label":"THC (Marijuana)","unit":"ng/mL","type":"number"},
    {"key":"coc","label":"Cocaine","unit":"ng/mL","type":"number"},
    {"key":"opi","label":"Opiates","unit":"ng/mL","type":"number"},
    {"key":"amp","label":"Amphetamines","unit":"ng/mL","type":"number"},
    {"key":"pcp","label":"PCP","unit":"ng/mL","type":"number"}
  ]'::jsonb,
  '[
    {"field":"thc","operator":">=","value":50,"label":"Positive","flagged":true},
    {"field":"coc","operator":">=","value":150,"label":"Positive","flagged":true},
    {"field":"opi","operator":">=","value":2000,"label":"Positive","flagged":true},
    {"field":"amp","operator":">=","value":500,"label":"Positive","flagged":true},
    {"field":"pcp","operator":">=","value":25,"label":"Positive","flagged":true},
    {"default":true,"label":"Negative","flagged":false}
  ]'::jsonb
),
(
  'Paternity/DNA',
  '[
    {"key":"probability_of_paternity","label":"Probability of Paternity","unit":"%","type":"number"},
    {"key":"conclusion","label":"Conclusion","type":"text"}
  ]'::jsonb,
  '[
    {"field":"probability_of_paternity","operator":">=","value":99.9,"label":"Paternity Confirmed","flagged":false},
    {"field":"probability_of_paternity","operator":"<","value":99.9,"label":"Excluded / Inconclusive","flagged":true}
  ]'::jsonb
),
(
  'COVID/Flu',
  '[
    {"key":"covid19","label":"COVID-19","type":"boolean"},
    {"key":"flu_a","label":"Influenza A","type":"boolean"},
    {"key":"flu_b","label":"Influenza B","type":"boolean"}
  ]'::jsonb,
  '[
    {"field":"covid19","operator":"==","value":true,"label":"Positive","flagged":true},
    {"field":"flu_a","operator":"==","value":true,"label":"Positive","flagged":true},
    {"field":"flu_b","operator":"==","value":true,"label":"Positive","flagged":true},
    {"default":true,"label":"Negative","flagged":false}
  ]'::jsonb
),
(
  'Cholesterol',
  '[
    {"key":"total_cholesterol","label":"Total Cholesterol","unit":"mg/dL","type":"number"}
  ]'::jsonb,
  '[
    {"field":"total_cholesterol","operator":">=","value":240,"label":"High","flagged":true},
    {"field":"total_cholesterol","operator":"between","value":[200,239],"label":"Borderline High","flagged":true},
    {"field":"total_cholesterol","operator":"<","value":200,"label":"Desirable","flagged":false}
  ]'::jsonb
),
(
  'A1C',
  '[
    {"key":"a1c","label":"Hemoglobin A1C","unit":"%","type":"number"}
  ]'::jsonb,
  '[
    {"field":"a1c","operator":">=","value":6.5,"label":"Diabetic","flagged":true},
    {"field":"a1c","operator":"between","value":[5.7,6.4],"label":"Pre-diabetic","flagged":true},
    {"field":"a1c","operator":"<","value":5.7,"label":"Normal","flagged":false}
  ]'::jsonb
),
(
  'Glucose',
  '[
    {"key":"glucose","label":"Fasting Glucose","unit":"mg/dL","type":"number"}
  ]'::jsonb,
  '[
    {"field":"glucose","operator":">=","value":126,"label":"Diabetic Range","flagged":true},
    {"field":"glucose","operator":"between","value":[100,125],"label":"Pre-diabetic Range","flagged":true},
    {"field":"glucose","operator":"<","value":100,"label":"Normal","flagged":false}
  ]'::jsonb
),
(
  'HIV',
  '[
    {"key":"hiv","label":"HIV 1/2 Antibody/Antigen","type":"boolean"}
  ]'::jsonb,
  '[
    {"field":"hiv","operator":"==","value":true,"label":"Reactive","flagged":true},
    {"field":"hiv","operator":"==","value":false,"label":"Non-Reactive","flagged":false}
  ]'::jsonb
),
(
  'Lipid Profile',
  '[
    {"key":"total_cholesterol","label":"Total Cholesterol","unit":"mg/dL","type":"number"},
    {"key":"ldl","label":"LDL","unit":"mg/dL","type":"number"},
    {"key":"hdl","label":"HDL","unit":"mg/dL","type":"number"},
    {"key":"triglycerides","label":"Triglycerides","unit":"mg/dL","type":"number"}
  ]'::jsonb,
  '[
    {"field":"ldl","operator":">=","value":160,"label":"High LDL","flagged":true},
    {"field":"hdl","operator":"<","value":40,"label":"Low HDL","flagged":true},
    {"field":"triglycerides","operator":">=","value":200,"label":"High Triglycerides","flagged":true},
    {"default":true,"label":"Within Range","flagged":false}
  ]'::jsonb
)
on conflict (name) do nothing;
