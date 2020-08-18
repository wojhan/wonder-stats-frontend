import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css'],
})
export class ErrorComponent implements OnInit, OnDestroy {
  backUrl = '/game';

  params;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.params = this.route.queryParams.subscribe((p) => {
      // Defaults to 0 if no query param provided.
      if (p.backUrl) {
        this.backUrl = p.backUrl;
      }
    });
  }

  ngOnDestroy(): void {
    this.params.unsubscribe();
  }
}
