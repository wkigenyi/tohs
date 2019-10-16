import { Injectable } from '@angular/core';
import { Hero } from './hero';
import { HEROES } from './mock_heroes';
import { Observable, of } from 'rxjs';
import { MessageService } from './message.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {catchError, map, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HeroService {

  private heroesUrl = 'api/heroes'; // url to web api
  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' })};

  constructor(
    private messageService: MessageService,
    private httpClient: HttpClient
    ) { }

  getHeroes(): Observable<Hero[]> {
    // Send Message after fetching heroes
    this.messageService.add('Hero Service: Fetched Heroes');
    return this.httpClient.get<Hero[]>(this.heroesUrl)
      .pipe(
        tap(_ => this.log('fetched heroes')),
        catchError(this.handleError('getHeroes', []))
      );
  }
  private handleError<T>(operation: string, result?: T) {
    return (error: any): Observable<T> => {
      // TODO Send the error to the remote logging infrastructure
      console.error(error);
      // TODO For User Consumption
      this.log(`${operation} failed, ${error.message}`);
      // Let the app keep running by returning an empty array
      return of(result as T);

    };
  }

  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    return this.httpClient.get<Hero>(url)
    .pipe(
      tap(_ => this.log(`fetched hero id = ${id}`)),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    )
    ;
  }

  updateHero(hero: Hero) {

    return this.httpClient.put(this.heroesUrl,hero,this.httpOptions)
      .pipe(
        tap(_ => {}),
        catchError(this.handleError<any>('updateHero'))
      );

  }

  addHero(hero: Hero): Observable<Hero> {
    return this.httpClient.post(this.heroesUrl, hero, this.httpOptions)
    .pipe(
      tap((newHero: Hero) => {this.log(`added new Hero id=${newHero.id}`)}),
      catchError(this.handleError<Hero>('addHero'))
    );
  }

  deleteHero(hero: Hero | number): Observable<Hero>{
    const id = typeof hero === 'number' ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;
    return this.httpClient.delete<Hero>(url, this.httpOptions)
    .pipe(
      tap(_ => this.log(`deleted hero ${id}`)),
      catchError(this.handleError<Hero>('deleteHero'))
    );
  }

  searchHero( term: string ): Observable<Hero[]>{
    /** Get Heroes who name matches a search term  */
    term = term.trim();
    if (!term) { return of([]); }
    return this.httpClient.get<Hero[]>(`${this.heroesUrl}/?name=${term}`).pipe(
      tap(_ => this.log(`found heroes matching term "${term}"`)),
      catchError(this.handleError<Hero[]>('searchHeroes', []))
    );
  }

  private log(message: string) {
    this.messageService.add(`Hero Service: ${message}`);
  }
}
