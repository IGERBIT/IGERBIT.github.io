class Term {
	constructor(object, term, explanation) {
		this.object = object;
		this.term = term;
		this.explanation = explanation;
		this.studied = false;
	}
}

let termRows = [];


function createTermRow() {
	var row = document.createElement('div', { class: 'row' });
	row.innerHTML = `<div class="col-3">
						<div class="mb-3">
							<label for="term" class="form-label">Term</label>
							<input type="text" class="form-control" id="term" placeholder="Enter term"/>
						</div>
					</div>
					<div class="col-8">
						<div class="mb-3">
							<label for="definition" class="form-label">Definition</label>
							<input type="text" class="form-control" id="definition" placeholder="Enter definition" />
						</div>
					</div>`;
	return row;
}

function createTermRows() {
	
}


window.onload = function () {

};
