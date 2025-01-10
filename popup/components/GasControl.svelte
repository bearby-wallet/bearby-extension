<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import Speed from "./icons/Speed.svelte";
  import { toKG } from "app/filters/numbers";

  const dispatch = createEventDispatcher();

  export let multiplier: number = 1;
  export let fee: number;

  $: list = [1, 2, 3];

  const handleOnSelect = (index: number) => {
    multiplier = index;
    dispatch("select", index);
  };
</script>

<ul>
  {#each list as index}
    <li
      class:selected={index === multiplier}
      onmouseup={() => handleOnSelect(index)}
    >
      <Speed length={index} />
      <h3>
        {toKG(fee * index)}
      </h3>
    </li>
  {/each}
</ul>

<style lang="scss">
  @use '../styles/mixins' as mix;

  ul {
    & {
      padding: 0px;
      margin: 0;
      background-color: var(--card-color);

      @include mix.flex-between-row;
      @include mix.border-radius(16px);

      & > li {
        & {
          cursor: pointer;
          margin: 5px;
          padding: 8px;
          min-width: 70px;
          min-height: 40px;
          text-align: center;

          @include mix.border-radius(16px);
          @include mix.flex-center-column;
        }

        &.selected {
          & {
            background-color: var(--background-color);
          }
        }

        & > h3 {
          & {
            margin: 0;
            @include mix.fluid-text(1024px, 10pt, 14pt);
          }
        }
      }
    }
  }
</style>
