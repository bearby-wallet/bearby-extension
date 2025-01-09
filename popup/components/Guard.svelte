<script lang="ts">
	import { _ } from 'popup/i18n';
  import { createEventDispatcher } from 'svelte';
  import { ShaAlgorithms } from "config/sha-algorithms";
  import { MAX_ITERACTIONS, ITERACTIONS, STEPS } from 'config/guard';


  const dispatch = createEventDispatcher();

  export let algorithm: ShaAlgorithms | string = ShaAlgorithms.Sha512;
  export let iteractions = ITERACTIONS;

  let advanced = false;

  function trigger() {
    dispatch('input', {
      algorithm,
      iteractions
    });
  }

  function handleOnChangeShaAlgorithm(e: Event) {
    const { value } = e.target as HTMLSelectElement;

    algorithm = value as ShaAlgorithms;

    trigger();
  }

  function handleInputIteractions(e: Event) {
    const { value } = e.target as HTMLInputElement;
    const numeric = Number(value);

    if (!isNaN(numeric) && numeric % 2 === 0) {
      iteractions = numeric;
      trigger();
    }
  }
</script>

<p
  class="advanced"
  onmouseup={() => advanced = !advanced}
  >
  {$_('restore.advanced')}
</p>
<div
  class="adv-wapr"
  class:show={advanced}
>
  <label>
    <b>
      {$_('restore.guard.iteractions')}
    </b>
    <input
      value={iteractions}
      type="number"
      step={STEPS}
      max={MAX_ITERACTIONS}
      min="0"
      required
      on:input={handleInputIteractions}
    >
  </label>
  <label>
    <b>
      {$_('restore.guard.algorithms')}
    </b>
    <select on:input={handleOnChangeShaAlgorithm}>
      <option
        value={ShaAlgorithms.Sha512}
        selected={ShaAlgorithms.Sha512 === algorithm}
      >
        {ShaAlgorithms.Sha512}
      </option>
      <option
        value={ShaAlgorithms.sha256}
        selected={ShaAlgorithms.sha256 === algorithm}
      >
        {ShaAlgorithms.sha256}
      </option>
    </select>
  </label>
</div>

<style lang="scss">
	@import "../styles/mixins";

  div.adv-wapr {
    display: none;
    margin-block-end: 5px;

    &.show {
      @include flex-center-column;
    }
    & > label {
      max-width: 290px;
      width: 100%;
      margin: 5px;
    }
  }
  p.advanced {
    cursor: pointer;
    color: var(--secondary-color);

    &:hover {
      color: var(--primary-color);
    }
  }
</style>
