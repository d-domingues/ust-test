import { Component } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatInput } from '@angular/material/input';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Item } from 'src/models/item';

import { ShoppingListService } from './shopping-list.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  showOnlyUnchecked = new BehaviorSubject(false);

  items$: Observable<Item[]> = combineLatest([
    this.service.items$,
    this.showOnlyUnchecked,
  ]).pipe(
    map(([items, sou]) =>
      (sou ? items.filter((i) => !i.active) : items).sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    )
  );

  constructor(public service: ShoppingListService) {}

  onAddItem = (input: MatInput) => {
    this.service.addElement(input.value);
    input.value = '';
  };

  onRemove = (itemName: string) => this.service.removeElement(itemName);

  onUpdate = (item: Item, checkbox: MatCheckbox) =>
    this.service.updateElement(item, checkbox);
}
