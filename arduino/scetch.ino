#define RED 10
#define GREEN 11
#define BLUE 9

#define OFF -1
#define STATIC 0
#define FADE 1

class RGBColor {
  private:
    int mR;
    int mG;
    int mB;
  public:
    RGBColor (int red, int green, int blue)
      :
        mR(red),
        mG(green),
        mB(blue)
    {
    }

    int r() const {return mR;}
    int b() const {return mG;}
    int g() const {return mB;}

    static RGBColor* parseColor() {
      int red = Serial.parseInt();
      int green = Serial.parseInt();
      int blue = Serial.parseInt();

      return new RGBColor(red, green, blue);
    }
};

void setColor(RGBColor* color) {
  analogWrite(RED, color->r());
  analogWrite(GREEN, color->g());
  analogWrite(BLUE, color->b());
}

void setup() {
  Serial.begin(9600);

  pinMode(RED, OUTPUT);
  pinMode(GREEN, OUTPUT);
  pinMode(BLUE, OUTPUT);

}

void loop() {
  RGBColor* black = new RGBColor(0, 0, 0);
  while (Serial.available() > 0) {
    int mode = Serial.parseInt();

    if (mode == OFF) {
      setColor(black);
      return;
    }

    if (mode == STATIC) {
        RGBColor* color = RGBColor::parseColor();

        setColor(color);

        return;
    }

    int argLength = 1;
    if (mode == FADE) {
      argLength = Serial.parseInt();
    }

    int colors[argLength];

    for (int i = 0; i < argLength; i++) {
    }

  }
}

