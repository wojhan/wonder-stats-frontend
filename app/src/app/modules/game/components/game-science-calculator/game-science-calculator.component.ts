import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {
  AbstractControl,
  Form,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ScienceCalculator } from './ScienceCalculator';

@Component({
  selector: 'app-game-science-calculator',
  templateUrl: './game-science-calculator.component.html',
  styleUrls: ['./game-science-calculator.component.css'],
})
export class GameScienceCalculatorComponent implements OnInit {
  form: FormGroup;
  formControls: { [key: string]: AbstractControl };

  constructor(public dialogRef: MatDialogRef<GameScienceCalculatorComponent>) {}

  private generateForm(): void {
    const validators = [Validators.required, Validators.min(0)];
    this.formControls = {
      ownTablet: new FormControl(null, { validators }),
      ownGear: new FormControl(null, { validators }),
      ownCompass: new FormControl(null, { validators }),
      ownThieves: new FormControl(
        { value: null, disabled: true },
        { validators }
      ),
      tabletToSteal: new FormControl(
        { value: null, disabled: true },
        { validators }
      ),
      gearToSteal: new FormControl(
        { value: null, disabled: true },
        { validators }
      ),
      compassToSteal: new FormControl(
        { value: null, disabled: true },
        { validators }
      ),
      maxSymbols: new FormControl(
        {
          value: null,
          disabled: true,
        },
        { validators }
      ),
      randomSymbols: new FormControl(
        { value: null, disabled: true },
        { validators }
      ),
    };
    this.form = new FormGroup(this.formControls);
  }

  private toggleControls(value): void {
    const emitOptions = { emitEvent: false, onlySelf: true };
    const ownSymbolsProvided =
      value.ownTablet && value.ownGear && value.ownCompass;
    const thievesProvided = !!value.ownThieves;

    if (!ownSymbolsProvided) {
      this.formControls.ownThieves.disable(emitOptions);
      this.formControls.maxSymbols.disable(emitOptions);
      this.formControls.randomSymbols.disable(emitOptions);
    } else {
      this.formControls.ownThieves.enable(emitOptions);
      this.formControls.maxSymbols.enable(emitOptions);
      this.formControls.randomSymbols.enable(emitOptions);
    }

    if (!thievesProvided) {
      this.formControls.tabletToSteal.disable(emitOptions);
      this.formControls.gearToSteal.disable(emitOptions);
      this.formControls.compassToSteal.disable(emitOptions);
    } else {
      this.formControls.tabletToSteal.enable(emitOptions);
      this.formControls.gearToSteal.enable(emitOptions);
      this.formControls.compassToSteal.enable(emitOptions);
    }
  }

  ngOnInit(): void {
    this.generateForm();

    this.form.valueChanges.subscribe((value) => {
      this.toggleControls(value);
    });
  }

  onSave(): void {
    const ownTablets = +this.formControls.ownTablet.value;
    const ownGears = +this.formControls.ownGear.value;
    const ownCompasses = +this.formControls.ownCompass.value;
    const ownThieves = +this.formControls.ownThieves.value;
    const tabletsToSteal = +this.formControls.tabletToSteal.value;
    const gearsToSteal = +this.formControls.gearToSteal.value;
    const compassToSteal = +this.formControls.compassToSteal.value;
    const maxSymbols = +this.formControls.maxSymbols.value;
    const randomSymbols = +this.formControls.randomSymbols.value;

    const calc = new ScienceCalculator(ownTablets, ownGears, ownCompasses);
    const symbols = ['tablet', 'gear', 'compass'];
    const possibleThefts = [tabletsToSteal, gearsToSteal, compassToSteal];
    const maxSymbol = calc.getMaxSymbol();

    for (let i = 0; i < ownThieves; i++) {
      const optimumSymbol = calc.findOptimumSymbol(
        possibleThefts[0] > 0,
        possibleThefts[1] > 0,
        possibleThefts[2] > 0
      );
      const index = symbols.indexOf(optimumSymbol);
      possibleThefts[index]--;
    }

    for (let i = 0; i < maxSymbols; i++) {
      calc.findOptimumSymbol(
        maxSymbol === 'tablet',
        maxSymbol === 'gear',
        maxSymbol === 'compass'
      );
    }

    for (let i = 0; i < randomSymbols; i++) {
      calc.findOptimumSymbol(true, true, true);
    }

    this.dialogRef.close(calc.getSumString());
  }
}
