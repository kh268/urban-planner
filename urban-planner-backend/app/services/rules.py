def apply_rules(row):
    if row["ndvi"] < 0.45 and row["population"] > 100000:
        return "Plant trees / add green roofs"
    elif row["uhi"] > 29 and row["ndvi"] < 0.5:
        return "Install cool roofs / reflective pavements"
    elif row["aod"] > 0.23:
        return "Reduce traffic / monitor air pollution"
    else:
        return "Stable environment"
