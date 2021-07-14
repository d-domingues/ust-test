import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { catchError, delay, pluck, tap } from 'rxjs/operators';
import { Item } from 'src/models/item';
import { User } from 'src/models/user';

@Injectable({ providedIn: 'root' })
export class ShoppingListService {
  private itemsSubject = new BehaviorSubject<Item[]>([]);
  items$: Observable<Item[]> = this.itemsSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject('logged_user') private user: User
  ) {
    this.getList();
  }

  getList = () =>
    this.http
      .post('https://listacompra.minecraftanarquia.xyz/getList', this.user)
      .pipe(
        pluck('data'),
        catchError(({ error }: HttpErrorResponse) => {
          console.error('data fetching error:', error.error);
          return [];
        })
      )
      .subscribe((items) => this.itemsSubject.next(items));

  addElement = (item: string) =>
    this.http
      .post<{ data: Item[] }>(
        'https://listacompra.minecraftanarquia.xyz/addElement',
        {
          ...this.user,
          item,
        }
      )
      .pipe(
        tap(({ data }) => this.itemsSubject.next(data)),
        catchError(({ error }: HttpErrorResponse) => {
          console.error('data postting error:', error.error);
          return EMPTY;
        })
      )
      .subscribe();

  removeElement = (item: string) =>
    this.http
      .post<{ data: Item[] }>(
        'https://listacompra.minecraftanarquia.xyz/removeElement',
        {
          ...this.user,
          item,
        }
      )
      .pipe(
        tap(({ data }) => this.itemsSubject.next(data)),
        catchError(({ error }: HttpErrorResponse) => {
          console.error('data removing error:', error.error);
          return EMPTY;
        })
      )
      .subscribe();

  updateElement = (item: Item, checkbox: MatCheckbox) =>
    this.http
      .post<{ data: Item[] }>(
        'https://listacompra.minecraftanarquia.xyz/updateElement',
        {
          ...this.user,
          item: item.name,
          active: '' + !item.active,
        }
      )
      .pipe(
        delay(0),
        tap(({ data }) => this.itemsSubject.next(data)),
        catchError(({ error }: HttpErrorResponse) => {
          console.error('data updating error:', error.error);
          this.itemsSubject.next(this.itemsSubject.value);

          checkbox.checked = item.active;
          return EMPTY;
        })
      )
      .subscribe();
}
